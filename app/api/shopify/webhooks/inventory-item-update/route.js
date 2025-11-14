import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function getAdminDb() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } else {
    throw new Error('Firebase Admin credentials not configured');
  }

  return getFirestore();
}

function verifyShopifyWebhook(rawBody, hmacHeader) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured in environment variables');
    return false;
  }

  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  const isValid = digest === hmacHeader;

  if (!isValid) {
    console.error('Webhook signature verification failed. Make sure SHOPIFY_WEBHOOK_SECRET matches Shopify webhook secret.');
  }

  return isValid;
}

async function fetchInventoryLevels(inventoryItemId) {
  const storeUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!storeUrl || !accessToken) {
    console.warn('SHOPIFY_STORE_URL or SHOPIFY_ACCESS_TOKEN not set - cannot refresh inventory levels.');
    return null;
  }

  try {
    const response = await fetch(
      `https://${storeUrl}/admin/api/2025-01/inventory_levels.json?inventory_item_ids=${inventoryItemId}`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch inventory levels from Shopify', await response.text());
      return null;
    }

    const data = await response.json();
    if (!data.inventory_levels || data.inventory_levels.length === 0) {
      return null;
    }

    const totalAvailable = data.inventory_levels.reduce((sum, level) => sum + (level.available ?? 0), 0);
    return {
      totalAvailable,
      levels: data.inventory_levels,
    };
  } catch (error) {
    console.error('Error fetching inventory levels from Shopify:', error);
    return null;
  }
}

async function findVariantRefsForInventoryItem(db, inventoryItemId) {
  const variantsToUpdate = [];
  const shopifyCollection = db.collection('shopifyItems');
  const shopifyItemsSnapshot = await shopifyCollection.get();

  for (const shopifyDoc of shopifyItemsSnapshot.docs) {
    const shopifyData = shopifyDoc.data();
    const rawProduct = shopifyData.rawProduct;

    if (rawProduct && rawProduct.variants) {
      for (const variant of rawProduct.variants) {
        if (variant.inventory_item_id === inventoryItemId) {
          const productsCollection = db.collection('products');
          const productSnapshot = await productsCollection
            .where('sourceShopifyId', '==', rawProduct.id.toString())
            .limit(1)
            .get();

          if (!productSnapshot.empty) {
            const productDoc = productSnapshot.docs[0];
            const variantsCollection = productDoc.ref.collection('variants');
            const variantsSnapshot = await variantsCollection.get();

            for (const variantDoc of variantsSnapshot.docs) {
              const variantData = variantDoc.data();

              if (variantData.shopifyInventoryItemId === inventoryItemId) {
                variantsToUpdate.push(variantDoc.ref);
                continue;
              }

              if (variant.sku && variantData.sku === variant.sku) {
                variantsToUpdate.push(variantDoc.ref);
                continue;
              }

              const shopifySize = variant.option1 || variant.option2 || variant.option3;
              if (
                shopifySize &&
                variantData.size &&
                variantData.size.toLowerCase().trim() === shopifySize.toLowerCase().trim()
              ) {
                variantsToUpdate.push(variantDoc.ref);
              }
            }
          }
        }
      }
    }
  }

  return variantsToUpdate;
}

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

    if (!hmacHeader) {
      console.error('Missing x-shopify-hmac-sha256 header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inventoryItemPayload = JSON.parse(rawBody);
    const inventoryItemId = inventoryItemPayload?.id || inventoryItemPayload?.inventory_item?.id;

    if (!inventoryItemId) {
      console.warn('Inventory item update payload missing inventory item id');
      return NextResponse.json({ ok: false, message: 'Missing inventory item id' }, { status: 200 });
    }

    console.log(`Received inventory item update webhook: inventory_item_id=${inventoryItemId}`);

    const db = getAdminDb();
    const inventoryLevels = await fetchInventoryLevels(inventoryItemId);

    if (!inventoryLevels) {
      return NextResponse.json({
        ok: true,
        inventory_item_id: inventoryItemId,
        message: 'Inventory item updated, but inventory levels could not be fetched.',
      });
    }

    const variantRefs = await findVariantRefsForInventoryItem(db, inventoryItemId);

    if (variantRefs.length === 0) {
      console.log(`No variants mapped to inventory item ${inventoryItemId}`);
      return NextResponse.json({
        ok: true,
        inventory_item_id: inventoryItemId,
        message: 'No variants mapped to this inventory item. Levels fetched for reference.',
        totalAvailable: inventoryLevels.totalAvailable,
      });
    }

    await Promise.all(
      variantRefs.map((variantRef) =>
        variantRef.update({
          stock: inventoryLevels.totalAvailable,
          updatedAt: FieldValue.serverTimestamp(),
        })
      )
    );

    console.log(
      `Updated ${variantRefs.length} variants for inventory item ${inventoryItemId} with total available ${inventoryLevels.totalAvailable}`
    );

    return NextResponse.json({
      ok: true,
      inventory_item_id: inventoryItemId,
      updatedVariants: variantRefs.length,
      totalAvailable: inventoryLevels.totalAvailable,
    });
  } catch (error) {
    console.error('Inventory item webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Shopify inventory item update webhook endpoint is active' });
}
