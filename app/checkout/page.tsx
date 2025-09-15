import {Metadata} from 'next';
import CheckoutPage from '@/components/checkout/CheckoutPage';
import {CheckoutProvider} from '@/context/CheckoutProvider';
import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getSessionId} from '@/utils/cookies';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Checkout',
  };
}

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const isGuestCheckout = params.guest === 'true';
  const session_id = await getSessionId();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user && !isGuestCheckout && session_id) {
    const callbackUrl = isGuestCheckout ? '/checkout?guest=true' : '/checkout';
    return redirect(
      `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}&source=checkout`
    );
  }

  if (!user && !session_id) {
    redirect('/');
  }

  return (
    <CheckoutProvider>
      <CheckoutPage />
    </CheckoutProvider>
  );
}
