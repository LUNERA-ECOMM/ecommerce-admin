'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthButton from '@/components/AuthButton';
import CategoryCard from '@/components/CategoryCard';
import CategoryCarousel from '@/components/CategoryCarousel';
import { useCategories, useAllProducts } from '@/lib/firestore-data';
import dynamic from 'next/dynamic';

const AdminRedirect = dynamic(() => import('@/components/AdminRedirect'), {
  ssr: false,
});

export default function Home() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading } = useAllProducts();

  const categoryPreviews = useMemo(() => {
    return categories.map((category) => {
      const categoryProducts = products
        .filter((product) => product.categoryId === category.id)
        .sort((a, b) => {
          const aViews = a.metrics?.totalViews || 0;
          const bViews = b.metrics?.totalViews || 0;
          return bViews - aViews;
        })
        .slice(0, 4);
      return {
        category,
        products: categoryProducts,
      };
    });
  }, [categories, products]);

  const loading = categoriesLoading || productsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/40 to-white">
      <AdminRedirect />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-pink-100/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
          <div className="hidden sm:flex sm:flex-col">
            <h1 className="text-2xl font-light text-slate-800 tracking-wide">
              Lingerie Boutique
            </h1>
            <p className="text-sm text-slate-500">
              Effortless softness for every day and night in.
            </p>
          </div>
          <div className="flex w-full justify-end sm:w-auto">
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Category carousel */}
      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <CategoryCarousel />
      </section>

      {/* Hero Section */}
      <section className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-pink-400">
            Explore the Edit
          </span>
          <h2 className="text-3xl font-light text-slate-800 sm:text-5xl">
            Curated collections for every mood and moment.
          </h2>
          <p className="text-base text-slate-600 sm:text-lg">
            From delicate lace to active-ready comfort. Discover the pieces that make you feel
            confident, effortless, and beautifully yourself.
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <main id="collection" className="mx-auto max-w-7xl px-3 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 text-center sm:mb-12 sm:text-left">
          <h3 className="text-xl font-medium text-slate-800 sm:text-2xl">Shop by category</h3>
          <p className="text-sm text-slate-600 sm:text-base">
            Choose a category to explore this week’s top four bestsellers, refreshed daily.
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-pink-50/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categoryPreviews.map(({ category, products }) => (
              <CategoryCard key={category.id} category={category} products={products} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-100/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          © 2024 Lingerie Boutique. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
