'use client';

import Link from 'next/link';

const buildFallbackItem = (category, index) => ({
  id: `placeholder-${index}`,
  image: `https://picsum.photos/seed/${category.value}-placeholder-${index}/400/500`,
});

export default function CategoryCard({ category, products }) {
  const previewItems =
    products.length >= 4
      ? products.slice(0, 4)
      : products.length > 0
      ? Array.from({ length: 4 }, (_, index) => products[index % products.length])
      : Array.from({ length: 4 }, (_, index) => buildFallbackItem(category, index));

  return (
    <Link
      href={`/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-pink-100/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      prefetch
      aria-label={`Explore ${category.label} collection`}
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-1 p-3 sm:gap-2 sm:p-4">
        {previewItems.map((item, index) => (
          <div
            key={`${category.value}-${item?.id ?? index}-${index}`}
            className="overflow-hidden rounded-2xl bg-pink-50/80 sm:rounded-3xl"
          >
            <img
              src={item?.image}
              alt={`${category.label} highlight ${index + 1}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 px-4 pb-5 sm:px-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-800 sm:text-xl">{category.label}</h3>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-pink-400">
            Shop
          </span>
        </div>
        <p className="text-sm text-slate-500 sm:text-base">{category.description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-pink-500">
          View collection
          <svg
            className="h-3 w-3 translate-y-[1px] transition group-hover:translate-x-1"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.172 2.172a4 4 0 0 1 5.656 5.656l-5.657 5.657a4 4 0 1 1-5.656-5.657l.707-.707 1.414 1.414-.707.707a2 2 0 1 0 2.829 2.829l5.657-5.657a2 2 0 0 0-2.829-2.829l-.707.707-1.414-1.414.707-.707Z" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

