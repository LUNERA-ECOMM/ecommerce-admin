'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { getCollectionPath } from '@/lib/store-collections';
import { useWebsite } from '@/lib/website-context';
import EditSiteInfoButton from '@/components/admin/EditSiteInfoButton';

const QUICK_ACTIONS = [
  {
    key: 'products',
    path: 'products',
    title: 'Manage products',
    description: 'Review, edit, and publish store products.',
  },
  {
    key: 'new-product',
    path: 'products/new',
    title: 'Create product manually',
    description: 'Add a product that is not sourced from Shopify.',
  },
  {
    key: 'shopify',
    path: 'overview/shopifyItems',
    title: 'Process Shopify imports',
    description: 'Select images, variants, and publish imported items.',
  },
  {
    key: 'categories',
    path: 'categories',
    title: 'Manage categories',
    description: 'Organize storefront collections and featured items.',
  },
  {
    key: 'promotions',
    path: 'promotions',
    title: 'Manage promotions',
    description: 'Schedule and monitor promotional campaigns.',
  },
  {
    key: 'analytics',
    path: 'analytics',
    title: 'Engagement analytics',
    description: 'Track category and product view metrics.',
  },
];

export default function EcommerceOverview() {
  const db = getFirebaseDb();
  const { selectedWebsite } = useWebsite();
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState({
    categories: [],
    products: [],
    promotions: [],
    shopifyItems: [],
  });
  const [viewMode, setViewMode] = useState('selected'); // 'selected' | 'all'

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesSnap, productsSnap, promotionsSnap, shopifySnap] = await Promise.all([
          getDocs(collection(db, ...getCollectionPath('categories', selectedWebsite))),
          getDocs(collection(db, ...getCollectionPath('products', selectedWebsite))),
          getDocs(collection(db, ...getCollectionPath('promotions', selectedWebsite))),
          getDocs(collection(db, ...getCollectionPath('shopifyItems'))).catch((error) => {
            // If shopifyItems fails due to permissions, return empty snapshot
            console.warn('Failed to load shopifyItems (may need admin auth):', error.message);
            return { docs: [] };
          }),
        ]);

        if (!isMounted) return;

        const categories = categoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const products = productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const promotions = promotionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const shopifyItems = shopifySnap.docs.map((doc) => {
          const data = doc.data();
          const createdAt =
            typeof data.createdAt?.toMillis === 'function'
              ? data.createdAt.toMillis()
              : data.createdAt?.seconds
              ? data.createdAt.seconds * 1000
              : 0;
          return {
            id: doc.id,
            ...data,
            createdAt,
            processedStorefronts: Array.isArray(data.processedStorefronts) ? data.processedStorefronts : [],
            storefronts: Array.isArray(data.storefronts) ? data.storefronts : [],
          };
        });

        console.log('📊 Loaded data:', {
          categories: categories.length,
          products: products.length,
          promotions: promotions.length,
          shopifyItems: shopifyItems.length,
          shopifyItemsData: shopifyItems.map(item => ({
            id: item.id,
            title: item.title,
            storefronts: item.storefronts,
            processedStorefronts: item.processedStorefronts,
          })),
        });
        setDatasets({ categories, products, promotions, shopifyItems });
      } catch (error) {
        console.error('Failed to load admin overview data', error);
        if (isMounted) {
          setDatasets({ categories: [], products: [], promotions: [], shopifyItems: [] });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [db, selectedWebsite]);

  useEffect(() => {
    setViewMode('selected');
  }, [selectedWebsite]);

  const allStorefronts = useMemo(() => {
    const set = new Set();
    datasets.categories.forEach((category) => (category.storefronts || []).forEach((sf) => set.add(sf)));
    datasets.products.forEach((product) => (product.storefronts || []).forEach((sf) => set.add(sf)));
    datasets.promotions.forEach((promo) => (promo.storefronts || []).forEach((sf) => set.add(sf)));
    if (set.size === 0) {
      set.add(selectedWebsite || 'LUNERA');
    }
    return Array.from(set).sort();
  }, [datasets, selectedWebsite]);

  const effectiveSelectedStorefront = useMemo(() => {
    if (allStorefronts.includes(selectedWebsite)) {
      return selectedWebsite;
    }
    return allStorefronts[0];
  }, [allStorefronts, selectedWebsite]);

  const isPendingForStorefront = (item, storefront) => {
    if (!storefront) {
      return false;
    }
    const processed = item.processedStorefronts || [];
    // If item has specific storefronts assigned, check those
    // Otherwise, item is available for all storefronts
    const targetStorefronts = item.storefronts && item.storefronts.length > 0 
      ? item.storefronts 
      : allStorefronts.length > 0 
        ? allStorefronts 
        : [storefront];
    return targetStorefronts.includes(storefront) && !processed.includes(storefront);
  };

  const isPendingForAnyStorefront = (item) => {
    const processed = item.processedStorefronts || [];
    // If item has specific storefronts assigned, check those
    // Otherwise, item is available for all storefronts (or pending if no storefronts exist yet)
    const targets = item.storefronts && item.storefronts.length > 0 
      ? item.storefronts 
      : allStorefronts.length > 0 
        ? allStorefronts 
        : [selectedWebsite || 'LUNERA'];
    if (targets.length === 0) {
      return processed.length === 0;
    }
    return targets.some((sf) => !processed.includes(sf));
  };

  const summaryAll = useMemo(() => ({
    totalProducts: datasets.products.length,
    totalCategories: datasets.categories.length,
    activeCategories: datasets.categories.filter((category) => category.active !== false).length,
    totalPromotions: datasets.promotions.length,
    pendingShopify: datasets.shopifyItems.filter((item) => isPendingForAnyStorefront(item)).length,
  }), [datasets, allStorefronts]);

  const summarySelected = useMemo(() => {
    const store = effectiveSelectedStorefront;
    const products = datasets.products.filter((product) => (product.storefronts || []).includes(store));
    const categories = datasets.categories.filter((category) => (category.storefronts || []).includes(store));
    const promotions = datasets.promotions.filter((promo) => (promo.storefronts || []).includes(store));
    const pendingShopify = datasets.shopifyItems.filter((item) => isPendingForStorefront(item, store));

    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      activeCategories: categories.filter((category) => category.active !== false).length,
      totalPromotions: promotions.length,
      pendingShopify: pendingShopify.length,
    };
  }, [datasets, effectiveSelectedStorefront, allStorefronts]);

  const displayedSummary = viewMode === 'all' ? summaryAll : summarySelected;

  const pendingShopifyPreview = useMemo(() => {
    const items = viewMode === 'all'
      ? datasets.shopifyItems.filter((item) => isPendingForAnyStorefront(item))
      : datasets.shopifyItems.filter((item) => isPendingForStorefront(item, effectiveSelectedStorefront));

    console.log('🔍 Pending Shopify preview:', {
      viewMode,
      effectiveSelectedStorefront,
      allStorefronts,
      totalItems: datasets.shopifyItems.length,
      filteredItems: items.length,
      items: items.map(item => ({ id: item.id, title: item.title })),
    });

    return items
      .map((item) => ({
        id: item.id,
        title: item.title || '',
        createdAt: item.createdAt || 0,
      }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 5);
  }, [datasets, viewMode, effectiveSelectedStorefront, allStorefronts]);

  const quickActions = useMemo(
    () =>
      QUICK_ACTIONS.map((action) => ({
        ...action,
        href: `/${effectiveSelectedStorefront}/admin/${action.path}`,
      })),
    [effectiveSelectedStorefront]
  );

  const summaryCards = useMemo(
    () => [
      { label: 'Products', value: displayedSummary.totalProducts },
      { label: 'Active categories', value: displayedSummary.activeCategories },
      { label: 'Total categories', value: displayedSummary.totalCategories },
      { label: 'Pending Shopify imports', value: displayedSummary.pendingShopify },
      { label: 'Promotions', value: displayedSummary.totalPromotions },
    ],
    [displayedSummary]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 text-zinc-900 transition-colors dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Admin overview
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Store operations
            </h1>
            <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
              Monitor the health of the storefront and jump straight into the day-to-day workflows.
            </p>
          </div>
          <EditSiteInfoButton />
        </header>

        {allStorefronts.length > 1 && (
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Viewing {viewMode === 'all' ? 'aggregate metrics across all storefronts' : `metrics for ${effectiveSelectedStorefront}`}
            </div>
            <div className="inline-flex rounded-full border border-zinc-200 bg-white/70 p-1 dark:border-zinc-700 dark:bg-zinc-900/60">
              <button
                type="button"
                onClick={() => setViewMode('selected')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  viewMode === 'selected'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400'
                }`}
              >
                {effectiveSelectedStorefront}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  viewMode === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400'
                }`}
              >
                All storefronts
              </button>
            </div>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/60"
            >
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold">
                {loading ? '—' : card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Quick actions</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-zinc-200/70 px-4 py-5 transition hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-zinc-800/70 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {action.title}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {action.description}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 transition group-hover:translate-x-1 dark:text-emerald-400">
                    Open
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Shopify queue
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {displayedSummary.pendingShopify > 0
                  ? 'Pending imports ready for processing.'
                  : 'All imported Shopify items are processed.'}
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-zinc-200/70 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                Loading queue…
              </div>
            ) : pendingShopifyPreview.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200/70 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                No pending Shopify items.
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {pendingShopifyPreview.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-zinc-200/70 px-4 py-3 text-sm text-zinc-700 transition hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-zinc-800/80 dark:text-zinc-200 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10"
                    >
                      <p className="line-clamp-2 font-medium">{item.title || 'Untitled item'}</p>
                    </li>
                  ))}
                </ul>
                {displayedSummary.pendingShopify > pendingShopifyPreview.length && (
                  <p className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Showing {pendingShopifyPreview.length} of {displayedSummary.pendingShopify} pending items.
                  </p>
                )}
              </>
            )}

            <Link
              href={`/${effectiveSelectedStorefront}/admin/overview/shopifyItems`}
              className="mt-auto inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/60 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-400"
            >
              Open Shopify queue
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}

