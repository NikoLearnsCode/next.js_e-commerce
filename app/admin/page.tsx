import {Metadata} from 'next';

import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function Admin() {
  return <AdminDashboard />;
}
