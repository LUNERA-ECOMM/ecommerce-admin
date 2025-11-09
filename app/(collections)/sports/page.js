import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { categories } from '@/lib/categories';
import { products } from '@/lib/products';

export default function SportsPage() {
  const category = categories.find((item) => item.value === 'sports');
  const categoryProducts = products.filter((product) => product.category === 'sports');

  if (!category) {
    return null;
  }

  return <CategoryPageTemplate category={category} products={categoryProducts} />;
}

