import ProductTable from '@/components/admin/products/ProductTable';
import {Product} from '@/lib/types/db';
import AdminHeader from '../shared/AdminHeader';

type ProductManagerProps = {
  products: Product[];
};

export default function ProductManager({products}: ProductManagerProps) {
  return (
    <div>
      <AdminHeader
        title='Produkthantering'
        count={products.length}
        buttonShow
      />
      <ProductTable products={products} />
    </div>
  );
}
