import AdminContextProvider from '@/context/AdminContextProvider';
import {getCategoriesWithChildren} from '@/actions/admin/categories';
import AdminUIWrapper from '@/components/admin/AdminUIWrapper';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryTree = await getCategoriesWithChildren();

  return (
    <AdminContextProvider categories={categoryTree}>
      <AdminUIWrapper>{children}</AdminUIWrapper>
    </AdminContextProvider>
  );
}
