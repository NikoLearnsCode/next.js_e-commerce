import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';
import {notFound} from 'next/navigation';
import {Metadata} from 'next';
import {authOptions} from '@/lib/auth.config';
import {getOrder} from '@/actions/orders';
import OrderDetailContent from './OrderDetailContent';
import {OrderWithItems} from '@/lib/types/db';

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Order #${resolvedParams.orderId.substring(0, 8)}`,
  };
}

export default async function OrderDetailPage({params}: Props) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect('/sign-in?next=/profile/orders');
  }

  const {success, order, error} = await getOrder(resolvedParams.orderId);

  if (!success || error || !order) {
    console.error('Error fetching order for page:', error);
    return notFound();
  }

  // Verify the order belongs to the current user
  if (order.user_id !== session.user.id) {
    return notFound();
  }

  return <OrderDetailContent order={order as OrderWithItems} />;
}
