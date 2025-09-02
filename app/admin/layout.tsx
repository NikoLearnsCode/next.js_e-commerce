import AdminContextProvider from '@/context/AdminContextProvider';
import {getCategoriesWithChildren} from '@/actions/admin/categories';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryTree = await getCategoriesWithChildren();

  return (
    <AdminContextProvider categories={categoryTree}>
      {children}
    </AdminContextProvider>
  );
}
