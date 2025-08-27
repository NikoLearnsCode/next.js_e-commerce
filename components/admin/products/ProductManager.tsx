import ProductTable from '@/components/admin/products/ProductTable';
import {Product} from '@/lib/validators';

type ProductManagerProps = {
  products: Product[];
};

export default function ProductManager({products}: ProductManagerProps) {
  return <ProductTable products={products} />;
}
