import AdminTable from '@/components/admin/shared/AdminTable';
import {getAllProducts} from '@/actions/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 1) {
    return redirect('/denied');
  }

  const products = await getAllProducts();

  if (!products || products.length === 0) {
    return <div>Inga produkter hittades.</div>;
  }

  // 1. Definiera exakt vilka kolumner du vill visa
  const desiredKeys = ['description', 'price', 'brand', 'category', 'slug', 'created_at', 'updated_at'];

  // 2. Extrahera och filtrera nycklarna
  const filteredKeys = Object.keys(products[0]).filter((key) =>
    desiredKeys.includes(key)
  );

  // 3. Transformera den filtrerade listan till tabell-formatet
  const columns = filteredKeys.map((header) => ({
    header: header,
    cell: (product: any) => (
      <div className='text-sm text-gray-900'>{String(product[header])}</div>
    ),
  }));

  // Logga den färdiga kolumn-arrayen för att se att det blev rätt
  console.log(columns);

  return <AdminTable data={products} columns={columns} />;
}
