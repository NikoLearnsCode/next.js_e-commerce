import {createClient} from '@/utils/supabase/server';
import {redirect} from 'next/navigation';
import {Metadata} from 'next';
import {getUserOrders} from '@/actions/orders';
import OrdersClientContent from './OrdersContent';

export const metadata: Metadata = {
  title: 'Mina ordrar',
};

export default async function ProfileOrdersPage() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in?next=/profile/orders');
  }

  const {success, orders, error} = await getUserOrders();

  if (!success || error) {
    console.error('Error fetching orders for page:', error);
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-2xl font-semibold mb-8'>Mina Ordrar</h1>
        <p className='text-red-600'>
          Kunde inte hämta dina ordrar. Försök igen senare.
        </p>
      </div>
    );
  }

  return (
    <OrdersClientContent orders={orders} />
  );
}
