'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { getCollectionPath } from './store-collections';
import { useWebsite } from './website-context';

/**
 * Transform a Firestore category document into the shape that the
 * e‑commerce UI expects.
 *
 * Notes:
 * - `storefronts` is kept for backwards compatibility, but with the
 *   single‑storefront setup it will usually just include `LUNERA` or be empty.
 */
const transformCategory = (doc) => {
  const data = doc.data();
  const storefronts = Array.isArray(data.storefronts) ? data.storefronts : [];
  return {
    id: doc.id,
    value: doc.id, // Use document ID as value for routing
    label: data.name || '',
    description: data.description || '',
    imageUrl: data.imageUrl || null,
    slug: data.slug || doc.id,
    active: data.active !== false,
    previewProductIds: data.previewProductIds || [],
    storefronts,
  };
};

/**
 * Transform a Firestore product document into the shape used by the UI.
 *
 * Responsibilities:
 * - Normalize `categoryIds` to an array.
 * - Expose both `categoryId` and `category` for convenience in components.
 * - Pick the first image as the main thumbnail.
 * - Keep raw `metrics` and `createdAt` for client‑side sorting.
 */
const transformProduct = (doc) => {
  const data = doc.data();
  const categoryIds = Array.isArray(data.categoryIds)
    ? data.categoryIds
    : data.categoryId
    ? [data.categoryId]
    : [];
  const storefronts = Array.isArray(data.storefronts) ? data.storefronts : [];
  return {
    id: doc.id,
    name: data.name || '',
    slug: data.slug || doc.id,
    price: data.basePrice || 0,
    image: data.images && data.images.length > 0 ? data.images[0] : null,
    categoryIds,
    category: categoryIds[0] || '',
    categoryId: categoryIds[0] || '',
    description: data.description || '',
    descriptionHtml: data.descriptionHtml || null,
    extraImages: Array.isArray(data.extraImages) ? data.extraImages.filter(Boolean) : [],
    specs: data.specs || null,
    active: data.active !== false,
    metrics: data.metrics || { totalViews: 0, totalPurchases: 0 },
    createdAt: data.createdAt || null,
    storefronts,
  };
};

/**
 * Live client‑side subscription to all active categories for the current website.
 *
 * Uses:
 * - Firestore client SDK with `onSnapshot` for real‑time updates.
 * - `getCollectionPath('categories', selectedWebsite)` so it works with the
 *   storefront folder structure (currently effectively just `LUNERA`).
 *
 * Returns:
 * - `categories`: transformed, active‑only, alphabetically sorted.
 * - `loading`: true until the first snapshot arrives or Firestore is unavailable.
 * - `error`: any Firestore error encountered while listening.
 */
export const useCategories = () => {
  const db = getFirebaseDb();
  const { selectedWebsite } = useWebsite();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return undefined;
    }

    // Fetch all categories from the storefront folder (e.g. LUNERA/categories/items)
    const categoriesQuery = query(
      collection(db, ...getCollectionPath('categories', selectedWebsite)),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const transformed = snapshot.docs
          .map(transformCategory)
          .filter((cat) => cat.active)
          .sort((a, b) => (a.label || '').localeCompare(b.label || ''));
        setCategories(transformed);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Failed to fetch categories', err);
        setError(err);
        setCategories([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, selectedWebsite]);

  return { categories, loading, error };
};

/**
 * Live subscription to all active products for a given category in the
 * current storefront.
 *
 * Implementation details:
 * - We query all products under the storefront’s `products/items` collection,
 *   then filter by `categoryId` client‑side. This avoids Firestore limitations
 *   around multiple `array-contains` filters and composite indexes.
 * - Sorting is also done client‑side by `createdAt` (newest first), falling
 *   back to `name` when timestamps are missing.
 */
export const useProductsByCategory = (categoryId) => {
  const db = getFirebaseDb();
  const { selectedWebsite } = useWebsite();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return undefined;
    }

    if (!categoryId) {
      setProducts([]);
      setLoading(false);
      return undefined;
    }

    // Query products from the storefront folder and then:
    // - Filter by `categoryId` & `active` on the client.
    // - Sort on the client to avoid composite index requirements.
    const productsQuery = query(
      collection(db, ...getCollectionPath('products', selectedWebsite))
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const transformed = snapshot.docs
          .map(transformProduct)
          .filter((prod) => {
            // Filter by categoryId and active status client-side
            return prod.active && prod.categoryIds?.includes(categoryId);
          })
          .sort((a, b) => {
            // Sort by createdAt if available, otherwise by name
            const aCreated = a.createdAt?.toMillis?.() || 0;
            const bCreated = b.createdAt?.toMillis?.() || 0;
            if (aCreated && bCreated) {
              return bCreated - aCreated; // Newest first
            }
            return (a.name || '').localeCompare(b.name || '');
          });
        setProducts(transformed);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Failed to fetch products', err);
        setError(err);
        setProducts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, categoryId, selectedWebsite]);

  return { products, loading, error };
};

/**
 * Live subscription to all active products in the current storefront.
 *
 * Use this for admin/product overviews where you want the full list.
 * Client‑side filtering/sorting is used for flexibility and to keep
 * Firestore index requirements minimal.
 */
export const useAllProducts = () => {
  const db = getFirebaseDb();
  const { selectedWebsite } = useWebsite();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return undefined;
    }

    // Fetch all products from the storefront folder, filter active client‑side,
    // and sort in memory (by `createdAt` then by `name`).
    const productsQuery = query(
      collection(db, ...getCollectionPath('products', selectedWebsite))
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const transformed = snapshot.docs
          .map(transformProduct)
          .filter((prod) => prod.active)
          .sort((a, b) => {
            // Sort by createdAt if available, otherwise by name
            const aCreated = a.createdAt?.toMillis?.() || 0;
            const bCreated = b.createdAt?.toMillis?.() || 0;
            if (aCreated && bCreated) {
              return bCreated - aCreated; // Newest first
            }
            return (a.name || '').localeCompare(b.name || '');
          });
        setProducts(transformed);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Failed to fetch products', err);
        setError(err);
        setProducts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, selectedWebsite]);

  return { products, loading, error };
};

/**
 * Convenience hook for homepage/category preview strips.
 *
 * - Wraps `useProductsByCategory` and then sorts by `metrics.totalViews`
 *   to approximate “bestsellers”, returning only the top `limit` products.
 */
export const useTopProductsByCategory = (categoryId, limit = 4) => {
  const { products, loading, error } = useProductsByCategory(categoryId);
  const topProducts = useMemo(() => {
    // Sort by metrics.totalViews or createdAt, then take top N
    return products
      .sort((a, b) => {
        const aViews = a.metrics?.totalViews || 0;
        const bViews = b.metrics?.totalViews || 0;
        return bViews - aViews;
      })
      .slice(0, limit);
  }, [products, limit]);

  return { products: topProducts, loading, error };
};

