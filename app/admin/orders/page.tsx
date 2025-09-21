'use server';

import {getAllOrders} from '@/actions/admin/admin.orders.actions';
import OrderManager from '@/components/admin/orders/OrderManager';

import {Metadata} from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Beställningar',
  };
}

interface OrdersPageProps {
  searchParams: Promise<{search?: string}>;
}

export default async function OrdersPage({searchParams}: OrdersPageProps) {
  const {search} = await searchParams;
  const orders = await getAllOrders(search);

  return <OrderManager orders={orders} />;
}
