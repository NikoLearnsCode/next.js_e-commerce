'use server';

import {getAllOrders} from '@/actions/admin/orders';
import OrderManager from '@/components/admin/orders/OrderManager';
// import {getServerSession} from 'next-auth';
// import {authOptions} from '@/lib/auth';
// import {redirect} from 'next/navigation';

import {Metadata} from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Beställningar',
  };
}

interface OrdersPageProps {
  searchParams: {search?: string};
}

export default async function OrdersPage({searchParams}: OrdersPageProps) {
  // const session = await getServerSession(authOptions);

  // if (session?.user.role !== 1) {
  //   return redirect('/denied');
  // }
  const orders = await getAllOrders(searchParams.search);


  return <OrderManager orders={orders} />;
}
