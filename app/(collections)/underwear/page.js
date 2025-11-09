import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { categories } from '@/lib/categories';
import { products } from '@/lib/products';

export default function UnderwearPage() {
  const category = categories.find((item) => item.value === 'underwear');
  const categoryProducts = products.filter((product) => product.category === 'underwear');

  if (!category) {
    return null;
  }

  return <CategoryPageTemplate category={category} products={categoryProducts} />;
}

