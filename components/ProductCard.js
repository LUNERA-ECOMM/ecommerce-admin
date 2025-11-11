'use client';

import Link from 'next/link';

const categoryLabels = {
  lingerie: 'Lingerie',
  underwear: 'Underwear',
  sports: 'Activewear',
  clothes: 'Clothing',
  dresses: 'Dresses',
};

export default function ProductCard({ product, categorySlug }) {
  const categoryLabel = categoryLabels[product.category] ?? 'Collection';

  const handleAddToCart = (event) => {
    event.preventDefault();
    // TODO: Implement cart functionality
    console.log('Added to cart:', product.name);
  };

  return (
    <Link
      href={`/${categorySlug}/${product.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white/90 shadow-sm ring-1 ring-pink-100/70 transition hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl"
      prefetch
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-pink-50/70 sm:aspect-[3/4]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-pink-200">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-5l-2 3-2-3H5a2 2 0 01-2-2V8z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 005 0"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-5">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-pink-400 sm:text-xs">
            {categoryLabel}
          </p>
          <h3 className="mt-2 text-sm font-medium text-slate-800 sm:text-base">
            {product.name}
          </h3>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-base font-semibold text-pink-500 sm:text-lg">
            ${product.price.toFixed(2)}
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-200/70 bg-white/90 text-pink-500 transition hover:bg-pink-100 hover:text-pink-600"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 6a3 3 0 1 1 6 0h3.75a.75.75 0 0 1 .735.89l-1.2 6.5a2.75 2.75 0 0 1-2.71 2.26H8.425a2.75 2.75 0 0 1-2.71-2.26l-1.2-6.5A.75.75 0 0 1 5.25 6H9Zm1.5 0a1.5 1.5 0 0 1 3 0h-3Z" />
              <path d="M9.75 18a.75.75 0 0 1 .75.75v.5a1 1 0 0 0 2 0v-.5a.75.75 0 1 1 1.5 0v.5a2.5 2.5 0 0 1-5 0v-.5a.75.75 0 0 1 .75-.75Z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
