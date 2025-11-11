#!/usr/bin/env node

/**
 * Seed Firestore with demo categories, products (with variants), and promotions.
 *
 * Usage:
 *   export FIREBASE_PROJECT_ID=ecommerce-2f366
 *   export FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ecommerce-2f366.iam.gserviceaccount.com
 *   export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
 *   npm run seed:dummy
 *
 * The script is idempotent: re-running it updates existing docs and creates any that are missing.
 */

const admin = require('firebase-admin');

const DEFAULT_PROJECT_ID = 'ecommerce-2f366';

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
    // Fallback to ADC. Inject the known project ID so Firestore doesn't complain when ADC omits it.
    admin.initializeApp({
      projectId: DEFAULT_PROJECT_ID,
    });
  }

  return admin.app();
}

const db = initializeAdmin().firestore();
const FieldValue = admin.firestore.FieldValue;

const categories = [
  {
    slug: 'lingerie',
    name: 'Lingerie',
    description: 'Romantic lace, effortless silhouettes, and everyday comfort.',
    imageUrl:
      'https://images.pexels.com/photos/7679657/pexels-photo-7679657.jpeg?auto=compress&cs=tinysrgb&w=800',
    previewProductIds: [],
  },
  {
    slug: 'underwear',
    name: 'Underwear',
    description: 'Soft essentials designed for daily wear.',
    imageUrl:
      'https://images.pexels.com/photos/1030895/pexels-photo-1030895.jpeg?auto=compress&cs=tinysrgb&w=800',
    previewProductIds: [],
  },
  {
    slug: 'sports',
    name: 'Activewear',
    description: 'Performance fabrics with studio-to-street styling.',
    imageUrl:
      'https://images.pexels.com/photos/6453399/pexels-photo-6453399.jpeg?auto=compress&cs=tinysrgb&w=800',
    previewProductIds: [],
  },
  {
    slug: 'dresses',
    name: 'Dresses',
    description: 'Elevated silhouettes for events, evenings, and weekends.',
    imageUrl:
      'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=800&q=80',
    previewProductIds: [],
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    description: 'Finish every look with curated jewelry and accents.',
    imageUrl:
      'https://images.pexels.com/photos/179909/pexels-photo-179909.jpeg?auto=compress&cs=tinysrgb&w=800',
    previewProductIds: [],
  },
];

const productCatalog = [
  {
    slug: 'blush-lace-bralette-set',
    name: 'Blush Lace Bralette Set',
    category: 'Lingerie',
    basePrice: 78,
    description:
      'A romantic lace bralette paired with a high-waist brief. Soft stretch mesh with supportive seams.',
    careInstructions: 'Hand wash cold. Lay flat to dry.',
    images: [
      'https://images.pexels.com/photos/7679657/pexels-photo-7679657.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/7679688/pexels-photo-7679688.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['lace', 'best seller', 'bridal'],
    variants: [
      {
        size: 'S',
        color: 'Blush',
        stock: 12,
        sku: 'BLB-S-BLUSH',
        images: [
          'https://images.pexels.com/photos/7679657/pexels-photo-7679657.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/7679688/pexels-photo-7679688.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
      {
        size: 'M',
        color: 'Blush',
        stock: 18,
        sku: 'BLB-M-BLUSH',
        // Example: Multiple images per variant (2-3 images)
        images: [
          'https://images.pexels.com/photos/7679688/pexels-photo-7679688.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/7679657/pexels-photo-7679657.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
      {
        size: 'L',
        color: 'Ivory',
        stock: 10,
        priceOverride: 82,
        sku: 'BLB-L-IVORY',
        images: [
          'https://images.pexels.com/photos/774860/pexels-photo-774860.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/7679657/pexels-photo-7679657.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
    ],
  },
  {
    slug: 'everyday-modal-brief',
    name: 'Everyday Modal Brief',
    category: 'Underwear',
    basePrice: 18,
    description:
      'Ultra-soft modal brief with bonded seams for a barely-there feel. Available in five core hues.',
    careInstructions: 'Machine wash cold. Tumble dry low.',
    images: [
      'https://images.pexels.com/photos/3757043/pexels-photo-3757043.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['modal', 'essentials'],
    variants: [
      {
        size: 'S',
        color: 'Fog',
        stock: 25,
        sku: 'MODALBRIEF-S-FOG',
        image: 'https://images.pexels.com/photos/3757043/pexels-photo-3757043.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
      {
        size: 'M',
        color: 'Fog',
        stock: 33,
        sku: 'MODALBRIEF-M-FOG',
        image: 'https://images.pexels.com/photos/3757043/pexels-photo-3757043.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
      {
        size: 'M',
        color: 'Midnight',
        stock: 18,
        sku: 'MODALBRIEF-M-MID',
        image: 'https://images.pexels.com/photos/3757044/pexels-photo-3757044.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
      {
        size: 'L',
        color: 'Petal',
        stock: 14,
        sku: 'MODALBRIEF-L-PET',
        image: 'https://images.pexels.com/photos/3757045/pexels-photo-3757045.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
    ],
  },
  {
    slug: 'soft-jersey-bralette',
    name: 'Soft Jersey Bralette',
    category: 'Underwear',
    basePrice: 32,
    description:
      'Supportive jersey bralette with adjustable straps and removable cups. Perfect for lounge days.',
    careInstructions: 'Machine wash cold in lingerie bag. Lay flat to dry.',
    images: [
      'https://images.pexels.com/photos/3738395/pexels-photo-3738395.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['loungewear', 'soft'],
    variants: [
      {
        size: 'XS',
        color: 'Charcoal',
        stock: 9,
        sku: 'JERBRA-XS-CHAR',
      },
      {
        size: 'S',
        color: 'Charcoal',
        stock: 15,
        sku: 'JERBRA-S-CHAR',
      },
      {
        size: 'M',
        color: 'Mauve',
        stock: 12,
        sku: 'JERBRA-M-MAUV',
        images: [
          'https://images.pexels.com/photos/3738298/pexels-photo-3738298.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/3738395/pexels-photo-3738395.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
    ],
  },
  {
    slug: 'mesh-panel-leggings',
    name: 'Mesh Panel Compression Leggings',
    category: 'Activewear',
    basePrice: 96,
    description:
      'High-rise legging with targeted compression and breathable mesh panels. 4-way stretch fabric.',
    careInstructions: 'Machine wash cold. Do not tumble dry.',
    images: [
      'https://images.pexels.com/photos/6453399/pexels-photo-6453399.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/6453404/pexels-photo-6453404.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['active', 'best seller'],
    variants: [
      {
        size: 'XS',
        color: 'Nightfall',
        stock: 8,
        sku: 'LEGGINGS-XS-NIGHT',
      },
      {
        size: 'S',
        color: 'Nightfall',
        stock: 14,
        sku: 'LEGGINGS-S-NIGHT',
      },
      {
        size: 'M',
        color: 'Nightfall',
        stock: 22,
        sku: 'LEGGINGS-M-NIGHT',
      },
      {
        size: 'M',
        color: 'Sage',
        stock: 17,
        sku: 'LEGGINGS-M-SAGE',
        images: [
          'https://images.pexels.com/photos/6453404/pexels-photo-6453404.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/6453399/pexels-photo-6453399.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
      {
        size: 'L',
        color: 'Sage',
        stock: 10,
        sku: 'LEGGINGS-L-SAGE',
        priceOverride: 99,
        images: [
          'https://images.pexels.com/photos/6453404/pexels-photo-6453404.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/6453399/pexels-photo-6453399.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
    ],
  },
  {
    slug: 'satin-slip-dress',
    name: 'Satin Bias Slip Dress',
    category: 'Dresses',
    basePrice: 148,
    description:
      'Luxurious midi slip dress cut on the bias for a flattering drape. Adjustable straps and silk-blend satin.',
    careInstructions: 'Dry clean only.',
    images: [
      'https://images.pexels.com/photos/949670/pexels-photo-949670.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['evening', 'silk'],
    variants: [
      {
        size: 'XS',
        color: 'Champagne',
        stock: 6,
        sku: 'SATINSLIP-XS-CHAMP',
      },
      {
        size: 'S',
        color: 'Champagne',
        stock: 10,
        sku: 'SATINSLIP-S-CHAMP',
      },
      {
        size: 'M',
        color: 'Midnight',
        stock: 9,
        sku: 'SATINSLIP-M-MID',
        images: [
          'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/949670/pexels-photo-949670.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
      {
        size: 'L',
        color: 'Emerald',
        stock: 5,
        sku: 'SATINSLIP-L-EMR',
        priceOverride: 158,
        images: [
          'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/949670/pexels-photo-949670.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
    ],
  },
  {
    slug: 'pleated-wrap-dress',
    name: 'Pleated Wrap Dress',
    category: 'Dresses',
    basePrice: 168,
    description:
      'Statement wrap dress with pleated skirt and tie waist. Perfect for garden parties and celebrations.',
    careInstructions: 'Machine wash gentle. Line dry.',
    images: [
      'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['event', 'wrap'],
    variants: [
      { size: 'S', color: 'Rose', stock: 7, sku: 'WRAPDRESS-S-ROSE' },
      { size: 'M', color: 'Rose', stock: 12, sku: 'WRAPDRESS-M-ROSE' },
      {
        size: 'M',
        color: 'Slate',
        stock: 11,
        sku: 'WRAPDRESS-M-SLATE',
      },
      {
        size: 'L',
        color: 'Slate',
        stock: 8,
        priceOverride: 172,
        sku: 'WRAPDRESS-L-SLATE',
      },
    ],
  },
  {
    slug: 'gemstone-drop-earrings',
    name: 'Gemstone Drop Earrings',
    category: 'Accessories',
    basePrice: 58,
    description:
      'Faceted gemstone drops on a 14k gold-plated hook. Available in moonstone, aquamarine, and garnet.',
    careInstructions: 'Store in pouch. Avoid water and perfume.',
    images: [
      'https://images.pexels.com/photos/1454172/pexels-photo-1454172.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['jewelry', 'handmade'],
    variants: [
      {
        size: null,
        color: 'Moonstone',
        stock: 20,
        sku: 'EARRINGS-MOON',
        images: [
          'https://images.pexels.com/photos/1454172/pexels-photo-1454172.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
      {
        size: null,
        color: 'Aquamarine',
        stock: 16,
        sku: 'EARRINGS-AQUA',
        images: [
          'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/1454172/pexels-photo-1454172.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
      {
        size: null,
        color: 'Garnet',
        stock: 18,
        sku: 'EARRINGS-GARN',
        images: [
          'https://images.pexels.com/photos/1454172/pexels-photo-1454172.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
    ],
  },
  {
    slug: 'layered-gold-necklace',
    name: 'Layered Gold Necklace',
    category: 'Accessories',
    basePrice: 72,
    description:
      'Three delicate chains with removable pendants for effortless layering.',
    careInstructions: 'Wipe clean with a soft cloth.',
    images: [
      'https://images.pexels.com/photos/1454173/pexels-photo-1454173.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['jewelry', 'layering'],
    variants: [
      {
        size: null,
        color: 'Gold',
        stock: 30,
        sku: 'NECKLACE-LAYER-GOLD',
        image: 'https://images.pexels.com/photos/1454173/pexels-photo-1454173.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
      {
        size: null,
        color: 'Rose Gold',
        stock: 18,
        priceOverride: 76,
        sku: 'NECKLACE-LAYER-ROSE',
        image: 'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
    ],
  },
  {
    slug: 'cashmere-lounge-set',
    name: 'Cashmere Lounge Set',
    category: 'Lingerie',
    basePrice: 220,
    description:
      'Luxurious cashmere blend lounge set featuring a relaxed pullover and tapered pant.',
    careInstructions: 'Dry clean or hand wash cold. Lay flat to dry.',
    images: [
      'https://images.pexels.com/photos/6311666/pexels-photo-6311666.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/6311657/pexels-photo-6311657.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['luxe', 'loungewear'],
    variants: [
      {
        size: 'XS',
        color: 'Oatmeal',
        stock: 4,
        sku: 'CASHSET-XS-OAT',
      },
      {
        size: 'S',
        color: 'Oatmeal',
        stock: 9,
        sku: 'CASHSET-S-OAT',
      },
      {
        size: 'M',
        color: 'Gray',
        stock: 7,
        sku: 'CASHSET-M-GRAY',
        images: [
          'https://images.pexels.com/photos/6311657/pexels-photo-6311657.jpeg?auto=compress&cs=tinysrgb&w=900',
          'https://images.pexels.com/photos/6311666/pexels-photo-6311666.jpeg?auto=compress&cs=tinysrgb&w=900',
        ],
      },
    ],
  },
  {
    slug: 'silk-eye-mask',
    name: 'Silk Eye Mask',
    category: 'Accessories',
    basePrice: 32,
    description:
      'Pure mulberry silk eye mask with adjustable strap for restful sleep.',
    careInstructions: 'Hand wash cold. Lay flat to dry.',
    images: [
      'https://images.pexels.com/photos/4492040/pexels-photo-4492040.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['sleep', 'silk'],
    variants: [
      {
        size: null,
        color: 'Ivory',
        stock: 25,
        sku: 'EYEMASK-IVORY',
        image: 'https://images.pexels.com/photos/4492040/pexels-photo-4492040.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
      {
        size: null,
        color: 'Midnight',
        stock: 20,
        sku: 'EYEMASK-MID',
        image: 'https://images.pexels.com/photos/4492041/pexels-photo-4492041.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
      {
        size: null,
        color: 'Rose',
        stock: 18,
        sku: 'EYEMASK-ROSE',
        image: 'https://images.pexels.com/photos/4492040/pexels-photo-4492040.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
    ],
  },
  {
    slug: 'organic-cotton-robe',
    name: 'Organic Cotton Robe',
    category: 'Lingerie',
    basePrice: 98,
    description:
      'Lightweight organic cotton robe with a relaxed drape and detachable belt.',
    careInstructions: 'Machine wash cold. Tumble dry low.',
    images: [
      'https://images.pexels.com/photos/6311658/pexels-photo-6311658.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['robe', 'organic'],
    variants: [
      {
        size: 'S/M',
        color: 'Cloud',
        stock: 16,
        sku: 'ROBE-SM-CLOUD',
      },
      {
        size: 'M/L',
        color: 'Cloud',
        stock: 14,
        sku: 'ROBE-ML-CLOUD',
      },
      {
        size: 'M/L',
        color: 'Seafoam',
        stock: 12,
        sku: 'ROBE-ML-SEA',
        priceOverride: 104,
      },
    ],
  },
  {
    slug: 'seamless-high-rise-brief',
    name: 'Seamless High-Rise Brief',
    category: 'Underwear',
    basePrice: 24,
    description:
      'Smoothing seamless brief with high-rise waist. Invisible under clothing.',
    careInstructions: 'Machine wash cold. Tumble dry low.',
    images: [
      'https://images.pexels.com/photos/6476006/pexels-photo-6476006.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['seamless', 'smoothing'],
    variants: [
      { size: 'S', color: 'Sand', stock: 30, sku: 'SEAMBRIEF-S-SAND' },
      { size: 'M', color: 'Sand', stock: 34, sku: 'SEAMBRIEF-M-SAND' },
      { size: 'L', color: 'Cocoa', stock: 28, sku: 'SEAMBRIEF-L-COCOA' },
      { size: 'XL', color: 'Cocoa', stock: 19, sku: 'SEAMBRIEF-XL-COCOA' },
    ],
  },
  {
    slug: 'travel-jewelry-case',
    name: 'Travel Jewelry Case',
    category: 'Accessories',
    basePrice: 42,
    description:
      'Compact jewelry storage with compartments for rings, bracelets, and necklaces.',
    careInstructions: 'Wipe clean with a damp cloth.',
    images: [
      'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=900',
    ],
    tags: ['travel', 'organization'],
    variants: [
      {
        size: null,
        color: 'Blush',
        stock: 22,
        sku: 'JEWELCASE-BLUSH',
        image: 'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
      {
        size: null,
        color: 'Ivory',
        stock: 18,
        sku: 'JEWELCASE-IVORY',
        image: 'https://images.pexels.com/photos/1454175/pexels-photo-1454175.jpeg?auto=compress&cs=tinysrgb&w=900',
      },
    ],
  },
];

const promotions = [
  {
    code: 'WELCOME15',
    description: '15% off your first order.',
    type: 'percentage',
    value: 15,
    appliesTo: {
      categories: [],
      products: [],
    },
    startDate: new Date(),
    endDate: null,
  },
  {
    code: 'SPRINGSET25',
    description: 'Save $25 on lingerie sets.',
    type: 'amount',
    value: 25,
    appliesTo: {
      categories: ['Lingerie'],
      products: ['blush-lace-bralette-set', 'cashmere-lounge-set'],
    },
    startDate: new Date(),
    endDate: null,
  },
];

async function seedCategories() {
  console.log('Seeding categories…');
  for (const category of categories) {
    const ref = db.collection('categories').doc(category.name);
    await ref.set(
      {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        previewProductIds: category.previewProductIds,
        active: true,
        metrics: {
          totalViews: 0,
          lastViewedAt: null,
        },
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
}

async function seedProducts() {
  console.log('Seeding products and variants…');
  for (const product of productCatalog) {
    const productRef = db.collection('products').doc(product.slug);
    const existing = await productRef.get();

    const timestamps = existing.exists
      ? { updatedAt: FieldValue.serverTimestamp() }
      : {
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

    await productRef.set(
      {
        name: product.name,
        slug: product.slug,
        categoryId: product.category,
        supplierId: null,
        basePrice: product.basePrice,
        description: product.description,
        careInstructions: product.careInstructions,
        tags: product.tags,
        images: product.images,
        active: true,
        metrics: {
          totalViews: 0,
          totalPurchases: 0,
          lastViewedAt: null,
        },
        ...timestamps,
      },
      { merge: true }
    );

    // Seed variants - ensure every color has images
    const variantsCollection = productRef.collection('variants');
    
    // Group variants by color to assign images per color
    const variantsByColor = new Map();
    for (const variant of product.variants) {
      const colorKey = variant.color || 'default';
      if (!variantsByColor.has(colorKey)) {
        variantsByColor.set(colorKey, []);
      }
      variantsByColor.get(colorKey).push(variant);
    }
    
    // Assign images to each color (reuse product images or variant-specific images)
    let imageIndex = 0;
    for (const [colorKey, colorVariants] of variantsByColor.entries()) {
      // Get variant images (support both `image` and `images` for backward compatibility)
      // Priority: variant.images > variant.image > product images
      const firstVariantWithImages = colorVariants.find(v => v.images || v.image);
      let colorImages = [];
      
      if (firstVariantWithImages) {
        // Use images array if provided, otherwise convert single image to array
        colorImages = Array.isArray(firstVariantWithImages.images)
          ? firstVariantWithImages.images.filter(Boolean)
          : firstVariantWithImages.image
          ? [firstVariantWithImages.image]
          : [];
      }
      
      // Fallback to product images if no variant-specific images
      if (colorImages.length === 0 && product.images && product.images.length > 0) {
        colorImages = [product.images[imageIndex % product.images.length]];
      }
      
      // Assign the same image(s) to all variants of this color
      for (const variant of colorVariants) {
        const variantId =
          variant.sku ||
          [
            variant.size ? variant.size.toLowerCase() : 'onesize',
            variant.color ? variant.color.toLowerCase() : 'standard',
          ].join('-');

        const variantRef = variantsCollection.doc(variantId);
        const variantExisting = await variantRef.get();
        const variantTimestamps = variantExisting.exists
          ? { updatedAt: FieldValue.serverTimestamp() }
          : {
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            };

        // Determine variant images: use variant.images if provided, otherwise variant.image, otherwise color's images
        let variantImages = [];
        if (Array.isArray(variant.images) && variant.images.length > 0) {
          variantImages = variant.images.filter(Boolean);
        } else if (variant.image) {
          variantImages = [variant.image];
        } else if (colorImages.length > 0) {
          variantImages = colorImages;
        }

        await variantRef.set(
          {
            size: variant.size || null,
            color: variant.color || null,
            stock: typeof variant.stock === 'number' ? variant.stock : 0,
            priceOverride:
              typeof variant.priceOverride === 'number'
                ? variant.priceOverride
                : null,
            sku: variant.sku || null,
            images: variantImages.length > 0 ? variantImages : null,
            metrics: {
              totalViews: 0,
              totalAddedToCart: 0,
              totalPurchases: 0,
            },
            ...variantTimestamps,
          },
          { merge: true }
        );
      }
      
      imageIndex++;
    }
  }
}

async function seedPromotions() {
  console.log('Seeding promotions…');
  for (const promo of promotions) {
    const promoRef = db.collection('promotions').doc(promo.code);
    await promoRef.set(
      {
        code: promo.code,
        description: promo.description,
        type: promo.type,
        value: promo.value,
        appliesTo: promo.appliesTo,
        startDate: promo.startDate
          ? admin.firestore.Timestamp.fromDate(new Date(promo.startDate))
          : null,
        endDate: promo.endDate
          ? admin.firestore.Timestamp.fromDate(new Date(promo.endDate))
          : null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
}

async function updateCategoryPreviews() {
  console.log('Updating category preview product IDs…');
  const productsSnapshot = await db.collection('products').get();

  const categoryMap = new Map();
  for (const doc of productsSnapshot.docs) {
    const data = doc.data();
    if (!data.categoryId || !data.active) continue;

    if (!categoryMap.has(data.categoryId)) {
      categoryMap.set(data.categoryId, []);
    }

    if (data.images && data.images.length > 0) {
      categoryMap.get(data.categoryId).push({
        id: doc.id,
        image: data.images[0],
      });
    }
  }

  for (const category of categories) {
    const previewProducts = categoryMap.get(category.name) || [];
    const previewIds = previewProducts.slice(0, 4).map((item) => item.id);
    await db
      .collection('categories')
      .doc(category.name)
      .set(
        {
          previewProductIds: previewIds,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  }
}

async function main() {
  try {
    await seedCategories();
    await seedProducts();
    // Note: previewProductIds are left empty - admins manually select products via category management UI
    await seedPromotions();

    console.log('✅ Dummy data seeded successfully.');
    console.log('💡 Tip: Use the category management UI to manually select which products appear in category card previews.');
  } catch (error) {
    console.error('❌ Failed to seed dummy data:', error);
    process.exitCode = 1;
  } finally {
    await admin.app().delete().catch(() => {});
  }
}

main();

