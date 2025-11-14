import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
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

/**
 * Verify Shopify webhook HMAC signature
 * Uses the webhook secret provided by Shopify to verify the request is authentic
 */
function verifyShopifyWebhook(rawBody, hmacHeader) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  
  if (!secret) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured in environment variables');
    return false;
  }

  // Verify the HMAC signature matches what Shopify sent
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

/**
 * Extract image URLs from Shopify product
 */
function extractImageUrls(product) {
  return (product.images || [])
    .map((img) => (typeof img === 'object' ? img.src : img))
    .filter(Boolean);
}

/**
 * Update Shopify items collection (raw data)
 */
async function updateShopifyItem(db, shopifyProduct) {
  const shopifyCollection = db.collection('shopifyItems');
  
  // Find document by shopifyId
  const snapshot = await shopifyCollection.where('shopifyId', '==', shopifyProduct.id).limit(1).get();
  
  if (snapshot.empty) {
    console.log(`Shopify item ${shopifyProduct.id} not found in shopifyItems, skipping update`);
    return null;
  }

  const docRef = snapshot.docs[0].ref;
  const existingData = snapshot.docs[0].data();
  
  const updateData = {
    title: shopifyProduct.title,
    handle: shopifyProduct.handle || null,
    status: shopifyProduct.status || null,
    vendor: shopifyProduct.vendor || null,
    productType: shopifyProduct.product_type || null,
    tags: shopifyProduct.tags
      ? shopifyProduct.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    imageUrls: extractImageUrls(shopifyProduct),
    rawProduct: shopifyProduct,
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(updateData, { merge: true });
  console.log(`Updated Shopify item: ${docRef.id}`);
  
  return docRef.id;
}

/**
 * Get list of storefronts by checking root-level collections
 */
async function getStorefronts(db) {
  const storefronts = [];
  try {
    // Get all root-level collections
    const collections = await db.listCollections();
    for (const coll of collections) {
      const id = coll.id;
      // Storefronts are root folders that have a 'products' subcollection
      // Skip known root collections like 'shopifyItems', 'orders', etc.
      if (id !== 'shopifyItems' && id !== 'orders' && id !== 'carts' && id !== 'users' && id !== 'userEvents') {
        // Check if this collection has a 'products' subcollection
        try {
          const itemsSnapshot = await coll.doc('products').collection('items').limit(1).get();
          if (!itemsSnapshot.empty || id === 'LUNERA') {
            // It's a storefront
            storefronts.push(id);
          }
        } catch (e) {
          // Not a storefront, skip
        }
      }
    }
  } catch (error) {
    console.error('Error getting storefronts:', error);
    // Fallback to default
    return ['LUNERA'];
  }
  return storefronts.length > 0 ? storefronts : ['LUNERA'];
}

/**
 * Update processed product if it exists across all storefronts
 */
async function updateProcessedProduct(db, shopifyProduct) {
  const storefronts = await getStorefronts(db);
  const updatedIds = [];

  const firstVariant = shopifyProduct.variants?.[0];
  const basePriceFromShopify = firstVariant ? parseFloat(firstVariant.price ?? 0) : NaN;
  const newImageUrls = extractImageUrls(shopifyProduct);

  // Search for products in each storefront
  for (const storefront of storefronts) {
    try {
      const productsCollection = db.collection(storefront).doc('products').collection('items');

      const snapshot = await productsCollection
        .where('sourceShopifyId', '==', shopifyProduct.id.toString())
        .get();

      if (snapshot.empty) {
        continue; // No products in this storefront
      }

      for (const productDoc of snapshot.docs) {
        const productRef = productDoc.ref;
        const variantsCollection = productRef.collection('variants');
        const productData = productDoc.data();

        const normalizedBasePrice = Number.isFinite(basePriceFromShopify)
          ? basePriceFromShopify
          : (typeof productData.basePrice === 'number' ? productData.basePrice : 0);

        const productUpdate = {
          basePrice: normalizedBasePrice,
          images: newImageUrls.length > 0 ? newImageUrls : productData.images || [],
          updatedAt: FieldValue.serverTimestamp(),
        };

        await productRef.update(productUpdate);

        if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
          const allVariantsSnapshot = await variantsCollection.get();
          const existingVariants = allVariantsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          for (const shopifyVariant of shopifyProduct.variants) {
            let variantRef = null;

            if (shopifyVariant.sku) {
              const matchedBySku = existingVariants.find((v) => v.sku === shopifyVariant.sku);
              if (matchedBySku) {
                variantRef = variantsCollection.doc(matchedBySku.id);
              }
            }

            if (!variantRef) {
              const shopifySize = shopifyVariant.option1 || shopifyVariant.option2 || shopifyVariant.option3;
              const shopifyColor = shopifyVariant.option1 || shopifyVariant.option2 || shopifyVariant.option3;

              const matchedByAttributes = existingVariants.find((v) => {
                const sizeMatch = shopifySize && v.size &&
                  v.size.toLowerCase().trim() === shopifySize.toLowerCase().trim();
                const colorMatch = shopifyColor && v.color &&
                  v.color.toLowerCase().trim() === shopifyColor.toLowerCase().trim();
                return sizeMatch || (sizeMatch && colorMatch);
              });

              if (matchedByAttributes) {
                variantRef = variantsCollection.doc(matchedByAttributes.id);
              }
            }

            if (variantRef) {
              // Get variant-specific images from Shopify
              const variantImageUrls = (shopifyProduct.images || [])
                .filter((img) => {
                  const imgVariantIds = img.variant_ids || [];
                  return imgVariantIds.includes(shopifyVariant.id);
                })
                .map((img) => (typeof img === 'object' ? img.src : img))
                .filter(Boolean);
              
              // Combine variant-specific images with main product images
              const allVariantImages = variantImageUrls.length > 0
                ? [...new Set([...variantImageUrls, ...newImageUrls])]
                : newImageUrls;

              const variantPrice = shopifyVariant.price != null ? parseFloat(shopifyVariant.price) : NaN;
              
              await variantRef.update({
                stock: shopifyVariant.inventory_quantity || 0,
                priceOverride: Number.isFinite(variantPrice) ? variantPrice : null,
                images: allVariantImages.length > 0 ? allVariantImages : undefined,
                updatedAt: FieldValue.serverTimestamp(),
              });
              console.log(`Updated variant: ${variantRef.id} (stock: ${shopifyVariant.inventory_quantity || 0}, images: ${allVariantImages.length})`);
            } else {
              console.log(`Could not match Shopify variant ${shopifyVariant.id} to existing variant`);
            }
          }
        }

        console.log(`Updated processed product: ${productDoc.id} in storefront: ${storefront}`);
        updatedIds.push({ id: productDoc.id, storefront });
      }
    } catch (error) {
      console.error(`Error updating products in storefront ${storefront}:`, error);
      // Continue with other storefronts
    }
  }

  return updatedIds;
}

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

    if (!hmacHeader) {
      console.error('Missing x-shopify-hmac-sha256 header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify webhook signature
    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const shopifyProduct = payload;

    console.log(`Received webhook for Shopify product: ${shopifyProduct.id} (${shopifyProduct.title})`);

    const db = getAdminDb();

    // Update raw Shopify item
    try {
      await updateShopifyItem(db, shopifyProduct);
      console.log(`Successfully updated Shopify item: ${shopifyProduct.id}`);
    } catch (error) {
      console.error(`Failed to update Shopify item ${shopifyProduct.id}:`, error);
      // Continue processing even if raw item update fails
    }

    // Update processed product if it exists
    try {
      const updatedProductIds = await updateProcessedProduct(db, shopifyProduct);
      console.log(`Successfully updated ${updatedProductIds.length} processed product(s)`);
    } catch (error) {
      console.error(`Failed to update processed product for Shopify ID ${shopifyProduct.id}:`, error);
      // Return error but don't fail completely
      return NextResponse.json(
        { ok: false, error: 'Failed to update processed product', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, productId: shopifyProduct.id });
  } catch (error) {
    console.error('Webhook processing error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification during setup)
export async function GET() {
  return NextResponse.json({ message: 'Shopify webhook endpoint is active' });
}

