import ProductTable from '@/components/admin/products/ProductTable';
import {Product} from '@/lib/types/db-types';
import AdminHeader from '../shared/AdminHeader';
import AdminSearch from '../shared/AdminSearch';

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
        formType='product'
      />
      <AdminSearch
        searchParam='search'
        maxLength={50}
        placeholder='SÖK produkt-id, namn, kategori, gender'
      />

      <ProductTable products={products} />
    </div>
  );
}
