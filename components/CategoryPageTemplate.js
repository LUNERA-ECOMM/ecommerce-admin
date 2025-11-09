import AuthButton from '@/components/AuthButton';
import AdminRedirect from '@/components/AdminRedirect';
import CategoryCarousel from '@/components/CategoryCarousel';
import ProductCard from '@/components/ProductCard';

export default function CategoryPageTemplate({ category, products }) {
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
        <CategoryCarousel align="start" />
      </section>

      {/* Hero Section */}
      <section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-pink-400">
            {category.label}
          </span>
          <h2 className="text-3xl font-light text-slate-800 sm:text-5xl">
            {category.description}
          </h2>
          <p className="text-base text-slate-600 sm:text-lg">
            Discover the full assortment of best-sellers, refreshed styles, and timeless pieces in
            our {category.label.toLowerCase()} collection.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <main className="mx-auto max-w-7xl px-3 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 text-center sm:mb-12 sm:text-left">
          <h3 className="text-xl font-medium text-slate-800 sm:text-2xl">
            {category.label} favorites
          </h3>
          <p className="text-sm text-slate-600 sm:text-base">
            Pieces designed for softness, style, and everyday confidence.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-pink-100/70 bg-white/80 p-6 text-center text-slate-500">
            Products will appear here soon. Check back shortly.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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

