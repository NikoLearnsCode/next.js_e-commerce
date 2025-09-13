'use server';

import {getAllOrders} from '@/actions/admin/orders';
import OrderManager from '@/components/admin/orders/OrderManager';
// import {getServerSession} from 'next-auth';
// import {authOptions} from '@/lib/auth';
// import {redirect} from 'next/navigation';
import NoResults from '@/components/admin/shared/NoResults';
import {Metadata} from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Beställningar',
  };
}

export default async function OrdersPage() {
  // const session = await getServerSession(authOptions);

  // if (session?.user.role !== 1) {
  //   return redirect('/denied');
  // }
  const orders = await getAllOrders();

  if (!orders || orders.length === 0) {
    return <NoResults message='Inga ordrar hittades.' />;
  }

  return <OrderManager orders={orders} />;
}
