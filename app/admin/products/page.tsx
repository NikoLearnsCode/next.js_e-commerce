import AdminTable from '@/components/admin/shared/AdminTable';
import {getAllProducts} from '@/actions/admin';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {redirect} from 'next/navigation';
import NoResults from '@/components/admin/shared/NoResults';

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 1) {
    return redirect('/denied');
  }

  const products = await getAllProducts();

  if (!products || products.length === 0) {
    return <NoResults message='Inga produkter hittades.' />;
  }

  /*   const desiredKeys = [
    'name',
    'price',
    'brand',
    'gender',
    'category',
    'slug',
    'created_at',
    'updated_at',
  ];

  const filteredKeys = Object.keys(products[0]).filter((key) =>
    desiredKeys.includes(key)
  );
 */

  const filteredKeys = Object.keys(products[0]);

  console.log('filteredKeys', filteredKeys);

  const columns = filteredKeys.map((header) => ({
    header: header.replace('_', ' '),

    cell: (product: any) => <div>{String(product[header])}</div>,
  }));

  // console.log(columns);

  return <AdminTable data={products} columns={columns} />;
}
