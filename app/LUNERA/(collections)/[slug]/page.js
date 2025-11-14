import { notFound } from 'next/navigation';
import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { getServerSideCategoryBySlug, getServerSideProductsByCategory, getServerSideInfo } from '@/lib/firestore-server';

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const storefront = 'LUNERA';

  const category = await getServerSideCategoryBySlug(slug, storefront);
  if (!category) {
    notFound();
  }

  const [products, info] = await Promise.all([
    getServerSideProductsByCategory(category.id, storefront),
    getServerSideInfo(),
  ]);

  return (
    <CategoryPageTemplate
      categoryId={category.id}
      category={category}
      products={products}
      info={info}
    />
  );
}
