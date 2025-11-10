import { notFound } from 'next/navigation';
import { getServerSideProductDetail } from '@/lib/firestore-server';
import ProductDetailPage from '@/components/ProductDetailPage';

export default async function ProductPage({ params }) {
  const resolved = await params;
  const slug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug;
  const productSlug = Array.isArray(resolved?.productSlug)
    ? resolved.productSlug[0]
    : resolved?.productSlug;

  if (!slug || !productSlug) {
    notFound();
  }

  const detail = await getServerSideProductDetail(slug, productSlug);

  if (!detail?.product || !detail?.category) {
    notFound();
  }

  return (
    <ProductDetailPage
      category={detail.category}
      product={detail.product}
      variants={detail.variants}
    />
  );
}

