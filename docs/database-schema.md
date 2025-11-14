# Database Schema Overview

This document captures the Firestore data model for the ecommerce platform. Update it whenever collections change.

## Contents

- [Collections](#collections)
  - [shopify](#shopify)
  - [products](#products)
  - [categories](#categories)
  - [orders](#orders)
  - [carts](#carts)
  - [promotions](#promotions)
  - [users](#users)
  - [userEvents](#userevents)
- [Indexes](#indexes)
- [Security Considerations](#security-considerations)

---

## Collections

All storefronts share the same root collections. Each document stores a `storefronts` array indicating where it is available. This allows a single product or category to appear in multiple storefronts without duplication.

### shopify
Staging area for raw Shopify imports.

Path: `/shopifyItems/{shopifyDocumentId}`

| Field | Type | Notes |
|-------|------|-------|
| `shopifyId` | string | Original Shopify product ID (stringified) |
| `title` | string | Shopify product title |
| `handle` | string | Shopify handle |
| `status` | string | Shopify status (`active`, `draft`, etc.) |
| `vendor` | string | Shopify vendor |
| `productType` | string | Shopify product type |
| `tags` | array | Tags from Shopify (split & trimmed) |
| `matchedCategorySlug` | string | Category guess produced during import |
| `imageUrls` | array | Normalized image URLs |
| `rawProduct` | map | Full Shopify payload (for downstream processing) |
| `storefronts` | array | Storefronts recommended for this product (`[]` until processed) |
| `processedStorefronts` | array | Storefronts where this product has already been processed |
| `autoProcess` | boolean | Optional flag to auto-create processed product |
| `createdAt` | timestamp | When import first stored the document |
| `updatedAt` | timestamp | Last import update |

### products
Processed (customer-facing) products. Single collection shared by all storefronts.

Path: `/products/{productId}`

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name |
| `slug` | string | URL slug |
| `storefronts` | array | Storefronts where product is visible (e.g. `['LUNERA', 'ATLANTIS']`) |
| `categoryIds` | array | IDs of categories associated with this product |
| `basePrice` | number | Default price when no variant override |
| `description` | string | Plain text description |
| `descriptionHtml` | string | Optional rich text description |
| `bulletPoints` | array | Optional bullet point list |
| `images` | array | Ordered list of primary image URLs |
| `extraImages` | array | Additional images |
| `tags` | array | Search/filter tags |
| `active` | boolean | Whether product should be shown |
| `sourceType` | string | `'shopify'` or `'manual'` |
| `sourceShopifyId` | string | Shopify product ID if sourced from Shopify |
| `manuallyEdited` | boolean | Indicates if admin modified content (webhooks preserve manual edits) |
| `autoProcessedAt` | timestamp | When auto processing created this product (optional) |
| `metrics` | map | `{ totalViews, totalPurchases, lastViewedAt }` |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

#### Variants (subcollection)
Path: `/products/{productId}/variants/{variantId}`

| Field | Type | Notes |
|-------|------|-------|
| `size` | string | Nullable |
| `color` | string | Nullable |
| `type` | string | Nullable (used when color is not applicable) |
| `sku` | string | SKU |
| `stock` | number | Inventory count |
| `priceOverride` | number | Optional per-variant price |
| `images` | array | Variant-specific images |
| `shopifyVariantId` | string | Shopify variant ID |
| `shopifyInventoryItemId` | string | Shopify inventory item ID (for stock sync) |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### categories
Shared category definitions.

Path: `/categories/{categoryId}`

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name |
| `slug` | string | URL slug |
| `description` | string | Optional description |
| `imageUrl` | string | Optional category image |
| `storefronts` | array | Storefronts where category is visible |
| `metrics` | map | `{ totalViews, lastViewedAt }` |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### orders
Immutable order records (shared across storefronts).

Path: `/orders/{orderId}`

Fields remain the same as earlier schema, with the addition of:

| Field | Type | Notes |
|-------|------|-------|
| `storefront` | string | Storefront associated with the order |

### carts
Path: `/carts/{cartId}` (unchanged). Optional `storefront` field may be added if carts become store-specific.

### promotions
Path: `/promotions/{promotionId}` (unchanged). Add `storefronts` array if promotions should be restricted.

### users
Path: `/users/{userId}` (unchanged).

### userEvents
Path: `/userEvents/{eventId}` (unchanged).

---

## Indexes

Common composite indexes to define once data stabilizes:

- Products filtered by `storefronts` and `active`.
- Products filtered by `storefronts` + `categoryIds`.
- Shopify staging filtered by `processedStorefronts`.
- Orders by `storefront` + `placedAt`.
- Any additional filters introduced in the admin UI (e.g., `storefronts` + `manuallyEdited`).

---

## Security Considerations

- Public read access allowed for `products`, `categories`, and `promotions` (with storefront filtering applied at query time).
- Writes restricted to admin users (via Firebase Auth custom claims or allowlist).
- Shopify webhooks require server credentials; ensure only backend calls can modify staging/processed data.
- Orders readable only by owners or admin accounts; writes go through server-side logic.
- Continue to secure `carts` and `userEvents` as before.

Update this document whenever the schema evolves.
