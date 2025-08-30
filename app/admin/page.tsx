import {Metadata} from 'next';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth.config';
import {redirect} from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function Admin() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 1) {
    return redirect('/denied');
  }

  return <AdminDashboard />;
}
