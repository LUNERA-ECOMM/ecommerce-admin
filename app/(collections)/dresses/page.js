import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { categories } from '@/lib/categories';
import { products } from '@/lib/products';

export default function DressesPage() {
  const category = categories.find((item) => item.value === 'dresses');
  const categoryProducts = products.filter((product) => product.category === 'dresses');

  if (!category) {
    return null;
  }

  return <CategoryPageTemplate category={category} products={categoryProducts} />;
}

