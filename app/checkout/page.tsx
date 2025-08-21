import {Metadata} from 'next';
import CheckoutPage from '@/components/checkout/CheckoutPage';
import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getSessionId} from '@/utils/cookies';

export const metadata: Metadata = {
  title: 'Checkout',
};

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const stepValue = Array.isArray(params.step)
    ? params.step[0]
    : params.step || 'delivery';

  const isGuestCheckout = params.guest === 'true';
  const session_id = await getSessionId();

  // Check if user is logged in with NextAuth
  const session = await getServerSession(authOptions);
  const user = session?.user;
  

  if (!user && !isGuestCheckout && session_id) {
    return redirect(
      `/sign-in?callbackUrl=/checkout?step=${stepValue}&source=checkout`
    );
  }

  if (!params.step) {
    redirect('/checkout?step=delivery');
  }

  if (!user && !session_id) {
    redirect('/');
  }

  return <CheckoutPage />;
}
