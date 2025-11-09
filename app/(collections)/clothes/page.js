import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { categories } from '@/lib/categories';
import { products } from '@/lib/products';

export default function ClothesPage() {
  const category = categories.find((item) => item.value === 'clothes');
  const categoryProducts = products.filter((product) => product.category === 'clothes');

  if (!category) {
    return null;
  }

  return <CategoryPageTemplate category={category} products={categoryProducts} />;
}

