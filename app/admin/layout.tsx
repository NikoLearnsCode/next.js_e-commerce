import AdminContextProvider from '@/context/AdminContextProvider';
import {getDataForProductForm} from '@/actions/admin/categories';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dropdownOptions = await getDataForProductForm();

  return (
    <AdminContextProvider categories={dropdownOptions}>
      {children}
    </AdminContextProvider>
  );
}
