import {getMainCategories} from '@/actions/admin';
import AdminTable from '@/components/admin/shared/AdminTable';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {redirect} from 'next/navigation';
import NoResults from '@/components/admin/shared/NoResults';

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 1) {
    return redirect('/denied');
  }
  const categories = await getMainCategories();

  if (!categories || categories.length === 0) {
    return <NoResults message='Inga kategorier hittades.' />;
  }

  const desiredKeys = [
    'name',
    'slug',
    'displayOrder',
    'isActive',
    'created_at',
    'updated_at',
  ];

  const filteredKeys = Object.keys(categories[0]).filter((key) =>
    desiredKeys.includes(key)
  );

  //   console.log('filteredKeys', filteredKeys);

  const columns = filteredKeys.map((key) => ({
    header: key.replace('_', ' '),
    cell: (category: any) => (
      <div className='text-sm text-gray-900'>{String(category[key])}</div>
    ),
  }));

  //   console.log('columns', columns);

  return <AdminTable data={categories} columns={columns} />;
}
