#!/usr/bin/env node

/**
 * Import products from Shopify API and match them to categories.
 * 
 * This script:
 * 1. Fetches products from Shopify Admin API
 * 2. Matches products to categories using tags, product type, and keywords
 * 3. Imports matching products into Firestore
 *
 * Usage:
 *   # Set Shopify credentials
 *   export SHOPIFY_STORE_URL=your-store.myshopify.com
 *   export SHOPIFY_ACCESS_TOKEN=your_access_token
 *   
 *   # Set Firebase credentials (optional if using ADC)
 *   export FIREBASE_PROJECT_ID=ecommerce-2f366
 *   export FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ecommerce-2f366.iam.gserviceaccount.com
 *   export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
 *   
 *   node scripts/import-shopify-products.js
 */

const admin = require('firebase-admin');

const DEFAULT_PROJECT_ID = 'ecommerce-2f366';

// Category matching configuration
const CATEGORY_MATCHING = {
  lingerie: {
    keywords: ['lingerie', 'bra', 'bralette', 'bra set', 'corset', 'bustier', 'teddy', 'bodysuit', 'garter', 'stockings', 'thong', 'panties set', 'matching set'],
    productTypes: ['lingerie', 'bra', 'bralette', 'underwear set'],
    tags: ['lingerie', 'bra', 'bralette', 'matching set'],
  },
  underwear: {
    keywords: ['underwear', 'panties', 'brief', 'thong', 'g-string', 'boy short', 'hipster', 'bikini', 'underwear set'],
    productTypes: ['underwear', 'panties', 'briefs', 'thong'],
    tags: ['underwear', 'panties', 'briefs', 'thong'],
  },
  sports: {
    keywords: ['sport', 'activewear', 'athletic', 'yoga', 'gym', 'workout', 'fitness', 'running', 'leggings', 'sports bra', 'athletic wear'],
    productTypes: ['activewear', 'sportswear', 'athletic', 'yoga wear'],
    tags: ['sport', 'activewear', 'athletic', 'yoga', 'fitness'],
  },
  dresses: {
    keywords: ['dress', 'gown', 'frock', 'evening dress', 'cocktail dress', 'maxi dress', 'midi dress', 'mini dress'],
    productTypes: ['dress', 'gown', 'evening wear'],
    tags: ['dress', 'gown', 'evening'],
  },
  clothes: {
    keywords: ['top', 'shirt', 'blouse', 'sweater', 'cardigan', 'jacket', 'coat', 'pants', 'trousers', 'skirt', 'shorts', 'jumpsuit', 'romper'],
    productTypes: ['top', 'shirt', 'blouse', 'sweater', 'jacket', 'pants', 'skirt'],
    tags: ['clothing', 'apparel', 'fashion'],
  },
};

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } else {
    admin.initializeApp({
      projectId: DEFAULT_PROJECT_ID,
    });
  }

  return admin.app();
}

const db = initializeAdmin().firestore();
const FieldValue = admin.firestore.FieldValue;

/**
 * Match a Shopify product to a category using multiple strategies
 */
function matchProductToCategory(product) {
  const title = (product.title || '').toLowerCase();
  const description = (product.body_html || '').toLowerCase();
  const productType = (product.product_type || '').toLowerCase();
  const tags = (product.tags || '').toLowerCase().split(',').map(t => t.trim());
  
  // Score each category
  const scores = {};
  
  for (const [categorySlug, config] of Object.entries(CATEGORY_MATCHING)) {
    let score = 0;
    
    // Check keywords in title and description
    for (const keyword of config.keywords) {
      if (title.includes(keyword)) score += 3;
      if (description.includes(keyword)) score += 1;
    }
    
    // Check product type
    if (config.productTypes.some(pt => productType.includes(pt))) {
      score += 5;
    }
    
    // Check tags
    for (const tag of tags) {
      if (config.tags.some(configTag => tag.includes(configTag))) {
        score += 4;
      }
    }
    
    if (score > 0) {
      scores[categorySlug] = score;
    }
  }
  
  // Return category with highest score, or null if no match
  const entries = Object.entries(scores);
  if (entries.length === 0) return null;
  
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Fetch all products from Shopify API with pagination
 */
async function fetchAllShopifyProducts(storeUrl, accessToken) {
  const products = [];
  let pageInfo = null;
  let hasNextPage = true;
  
  const baseUrl = `https://${storeUrl}/admin/api/2025-01/products.json`;
  
  while (hasNextPage) {
    let url = baseUrl;
    if (pageInfo) {
      url += `?page_info=${pageInfo}`;
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}\n${errorText}`);
      }
      
      const data = await response.json();
      const pageProducts = data.products || [];
      products.push(...pageProducts);
      
      // Check for pagination
      const linkHeader = response.headers.get('link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch = linkHeader.match(/<[^>]+page_info=([^>]+)>[^<]*rel="next"/);
        if (nextMatch) {
          pageInfo = nextMatch[1];
        } else {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
      
      console.log(`  • Fetched ${pageProducts.length} products (total: ${products.length})`);
      
      // Rate limiting: Shopify allows 2 requests per second, so wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error fetching products:`, error);
      throw error;
    }
  }
  
  return products;
}

/**
 * Convert Shopify product to Firestore format
 */
function transformShopifyProduct(shopifyProduct, categoryId) {
  // Generate slug from title
  const slug = shopifyProduct.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Extract images
  const images = (shopifyProduct.images || []).map(img => img.src).filter(Boolean);
  
  // Get base price from first variant
  const firstVariant = shopifyProduct.variants && shopifyProduct.variants[0];
  const basePrice = firstVariant ? parseFloat(firstVariant.price) : 0;
  
  return {
    name: shopifyProduct.title,
    slug,
    categoryId,
    supplierId: null, // Can be set later if you have supplier info
    basePrice,
    description: shopifyProduct.body_html || shopifyProduct.body || '',
    images: images.length > 0 ? images : null,
    tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map(t => t.trim()) : [],
    active: shopifyProduct.status === 'active',
    metrics: {
      totalViews: 0,
      totalPurchases: 0,
      lastViewedAt: null,
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

/**
 * Convert Shopify variants to Firestore format
 */
function transformShopifyVariants(shopifyProduct) {
  if (!shopifyProduct.variants || shopifyProduct.variants.length === 0) {
    return [];
  }
  
  return shopifyProduct.variants.map(variant => {
    // Extract variant images (if variant has image_id, find matching image)
    let variantImages = [];
    if (variant.image_id && shopifyProduct.images) {
      const variantImage = shopifyProduct.images.find(img => img.id === variant.image_id);
      if (variantImage) {
        variantImages = [variantImage.src];
      }
    }
    
    // If no variant-specific image, use product images
    if (variantImages.length === 0 && shopifyProduct.images && shopifyProduct.images.length > 0) {
      variantImages = [shopifyProduct.images[0].src];
    }
    
    return {
      size: variant.option1 || null,
      color: variant.option2 || variant.option1 || null,
      sku: variant.sku || null,
      stock: variant.inventory_quantity || 0,
      priceOverride: parseFloat(variant.price) !== parseFloat(shopifyProduct.variants[0].price) 
        ? parseFloat(variant.price) 
        : null,
      images: variantImages.length > 0 ? variantImages : null,
      metrics: {
        totalViews: 0,
        totalAddedToCart: 0,
        totalPurchases: 0,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
  });
}

/**
 * Ensure category exists in Firestore
 */
async function ensureCategory(categorySlug, categoryName) {
  const categoryRef = db.collection('categories').doc(categoryName);
  const categoryDoc = await categoryRef.get();
  
  if (!categoryDoc.exists) {
    // Default category images (you can customize these)
    const categoryImages = {
      lingerie: 'https://images.pexels.com/photos/7679657/pexels-photo-7679657.jpeg?auto=compress&cs=tinysrgb&w=800',
      underwear: 'https://images.pexels.com/photos/1030895/pexels-photo-1030895.jpeg?auto=compress&cs=tinysrgb&w=800',
      sports: 'https://images.pexels.com/photos/6453399/pexels-photo-6453399.jpeg?auto=compress&cs=tinysrgb&w=800',
      dresses: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=800&q=80',
      clothes: 'https://images.pexels.com/photos/9963294/pexels-photo-9963294.jpeg?auto=compress&cs=tinysrgb&w=800',
    };
    
    const categoryDescriptions = {
      lingerie: 'Romantic lace, effortless silhouettes, and everyday comfort.',
      underwear: 'Soft essentials designed for daily wear.',
      sports: 'Performance fabrics with studio-to-street styling.',
      dresses: 'Elevated silhouettes for events, evenings, and weekends.',
      clothes: 'Relaxed tailoring and cozy knits for effortless style.',
    };
    
    await categoryRef.set({
      name: categoryName,
      slug: categorySlug,
      description: categoryDescriptions[categorySlug] || '',
      imageUrl: categoryImages[categorySlug] || '',
      active: true,
      previewProductIds: [],
      metrics: {
        totalViews: 0,
        lastViewedAt: null,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    console.log(`  • Created category: ${categoryName}`);
  }
  
  return categoryName;
}

/**
 * Import products from Shopify
 */
async function importProducts() {
  const storeUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  if (!storeUrl || !accessToken) {
    throw new Error('Missing required environment variables: SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN');
  }
  
  console.log(`\n🛍️  Fetching products from Shopify store: ${storeUrl}`);
  console.log('This may take a while depending on the number of products...\n');
  
  // Fetch all products
  const shopifyProducts = await fetchAllShopifyProducts(storeUrl, accessToken);
  console.log(`\n✅ Fetched ${shopifyProducts.length} products from Shopify\n`);
  
  // Match products to categories
  const matchedProducts = [];
  const unmatchedProducts = [];
  
  for (const product of shopifyProducts) {
    const categorySlug = matchProductToCategory(product);
    if (categorySlug) {
      const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
      matchedProducts.push({ product, categorySlug, categoryName });
    } else {
      unmatchedProducts.push(product);
    }
  }
  
  console.log(`📊 Matching Results:`);
  console.log(`  • Matched: ${matchedProducts.length} products`);
  console.log(`  • Unmatched: ${unmatchedProducts.length} products\n`);
  
  if (unmatchedProducts.length > 0) {
    console.log('Unmatched products (first 10):');
    unmatchedProducts.slice(0, 10).forEach(p => {
      console.log(`  - ${p.title} (Type: ${p.product_type || 'N/A'}, Tags: ${p.tags || 'N/A'})`);
    });
    if (unmatchedProducts.length > 10) {
      console.log(`  ... and ${unmatchedProducts.length - 10} more`);
    }
    console.log('');
  }
  
  // Group by category
  const productsByCategory = {};
  for (const { product, categorySlug, categoryName } of matchedProducts) {
    if (!productsByCategory[categorySlug]) {
      productsByCategory[categorySlug] = [];
    }
    productsByCategory[categorySlug].push({ product, categoryName });
  }
  
  // Import products
  let totalImported = 0;
  let totalSkipped = 0;
  
  for (const [categorySlug, products] of Object.entries(productsByCategory)) {
    const categoryName = products[0].categoryName;
    console.log(`\n📦 Importing ${products.length} products to category: ${categoryName}`);
    
    // Ensure category exists
    await ensureCategory(categorySlug, categoryName);
    
    for (const { product } of products) {
      try {
        const firestoreProduct = transformShopifyProduct(product, categoryName);
        const productRef = db.collection('products').doc(firestoreProduct.slug);
        
        // Check if product already exists
        const existing = await productRef.get();
        if (existing.exists) {
          console.log(`  ⏭️  Skipped (exists): ${firestoreProduct.name}`);
          totalSkipped++;
          continue;
        }
        
        // Save product
        await productRef.set(firestoreProduct);
        
        // Save variants
        const variants = transformShopifyVariants(product);
        if (variants.length > 0) {
          const variantsCollection = productRef.collection('variants');
          for (const variant of variants) {
            const variantId = variant.sku || 
              [
                variant.size ? variant.size.toLowerCase().replace(/\s+/g, '-') : 'onesize',
                variant.color ? variant.color.toLowerCase().replace(/\s+/g, '-') : 'standard',
              ].join('-');
            
            await variantsCollection.doc(variantId).set(variant);
          }
        }
        
        console.log(`  ✅ Imported: ${firestoreProduct.name} (${variants.length} variants)`);
        totalImported++;
      } catch (error) {
        console.error(`  ❌ Failed to import ${product.title}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`  • Imported: ${totalImported} products`);
  console.log(`  • Skipped: ${totalSkipped} products (already exist)`);
  console.log(`  • Unmatched: ${unmatchedProducts.length} products`);
}

async function main() {
  try {
    await importProducts();
  } catch (error) {
    console.error('❌ Failed to import products:', error);
    process.exitCode = 1;
  } finally {
    await admin.app().delete().catch(() => {});
  }
}

main();

