import AdminProvider from '@/context/AdminProvider';
import {getCategoriesWithChildren} from '@/actions/admin/admin.categories.actions';
import AdminUIWrapper from '@/components/admin/AdminUIWrapper';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {redirect} from 'next/navigation';

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
    <AdminProvider categories={categoryTree}>
      <AdminUIWrapper>{children}</AdminUIWrapper>
    </AdminProvider>
  );
}
