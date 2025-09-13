import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';
import {Metadata} from 'next';

import {authOptions} from '@/lib/auth';

import {getUserOrdersOverview} from '@/actions/orders';
import OrdersClientContent from './OrdersContent';

export const metadata: Metadata = {
  title: 'Mina ordrar',
};

export default async function ProfileOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect('/sign-in');
  }

  const {success, orders, error} = await getUserOrdersOverview();

  if (!success || error) {
    console.error('Error fetching orders for page:', error);
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-2xl font-semibold mb-8'>Mina ordrar</h1>
        <p className='text-red-600'>
          Kunde inte hämta dina ordrar. Försök igen senare.
        </p>
      </div>
    );
  }

  return <OrdersClientContent orders={orders} />;
}
