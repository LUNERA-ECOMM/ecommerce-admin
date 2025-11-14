export const COLLECTION_PATHS = {
  products: ['products'],
  categories: ['categories'],
  promotions: ['promotions'],
  shopifyItems: ['shopifyItems'], // Stays at root, not per-storefront
  orders: ['orders'],
  carts: ['carts'],
  users: ['users'],
  userEvents: ['userEvents'],
};

// Storefront-specific collections (products, categories, promotions)
const STOREFRONT_COLLECTIONS = ['products', 'categories', 'promotions'];

/**
 * Get collection path - storefront-specific collections go under storefront folder
 * @param {string} name - Collection name
 * @param {string} storefront - Storefront name (e.g., 'LUNERA')
 * @param {...any} additionalSegments - Additional path segments
 */
export const getCollectionPath = (name, storefront = null, ...additionalSegments) => {
  const base = COLLECTION_PATHS[name];
  if (!base) {
    throw new Error(`Unknown collection path for ${name}`);
  }
  
  // If it's a storefront-specific collection and storefront is provided, nest under storefront
  if (STOREFRONT_COLLECTIONS.includes(name) && storefront) {
    return [storefront, ...base, 'items', ...additionalSegments];
  }
  
  // Otherwise use root path
  return [...base, ...additionalSegments];
};

/**
 * Get document path - storefront-specific collections go under storefront folder
 * @param {string} name - Collection name
 * @param {string} docId - Document ID
 * @param {string} storefront - Storefront name (e.g., 'LUNERA')
 * @param {...any} additionalSegments - Additional path segments
 */
export const getDocumentPath = (name, docId, storefront = null, ...additionalSegments) => [
  ...getCollectionPath(name, storefront),
  docId,
  ...additionalSegments,
];

// Legacy helpers - now properly use storefront parameter
export const getStoreCollectionPath = (name, website = null, ...additionalSegments) =>
  getCollectionPath(name, website, ...additionalSegments);

export const getStoreDocPath = (name, docId, website = null, ...additionalSegments) =>
  getDocumentPath(name, docId, website, ...additionalSegments);

