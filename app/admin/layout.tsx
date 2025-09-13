import AdminContextProvider from '@/context/AdminContextProvider';
import {getCategoriesWithChildren} from '@/actions/admin/categories';
import AdminUIWrapper from '@/components/admin/AdminUIWrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getServerSession(authOptions);
  if (session?.user.role !== 1) {
    return redirect('/denied');
  }

  const categoryTree = await getCategoriesWithChildren();

  return (
    <AdminContextProvider categories={categoryTree}>
      <AdminUIWrapper>{children}</AdminUIWrapper>
    </AdminContextProvider>
  );
}
