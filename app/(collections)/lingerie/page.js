import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { categories } from '@/lib/categories';
import { products } from '@/lib/products';

export default function LingeriePage() {
  const category = categories.find((item) => item.value === 'lingerie');
  const categoryProducts = products.filter((product) => product.category === 'lingerie');

  if (!category) {
    return null;
  }

  return <CategoryPageTemplate category={category} products={categoryProducts} />;
}

