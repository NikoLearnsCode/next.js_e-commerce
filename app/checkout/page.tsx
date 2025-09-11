import {Metadata} from 'next';
import CheckoutPage from '@/components/checkout/CheckoutPage';
import {redirect} from 'next/navigation';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getSessionId} from '@/utils/cookies';

import {validateStep, getCheckoutUrl} from '@/components/checkout/utils/steps';

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

  const stepParam = Array.isArray(params.step) ? params.step[0] : params.step;
  const isGuestCheckout = params.guest === 'true';
  const session_id = await getSessionId();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Check if cart has items - redirect if empty
  /*   const {cartItems} = await getCart();
  if (cartItems.length === 0) {
    redirect('/cart');
  } */

  // Validate step (utan completed steps på server-side)
  const validatedStep = validateStep(stepParam || null, []);

  // Authentication flow
  if (!user && !isGuestCheckout && session_id) {
    const signInUrl = `/sign-in?callbackUrl=${encodeURIComponent(
      getCheckoutUrl(validatedStep, isGuestCheckout)
    )}&source=checkout`;
    return redirect(signInUrl);
  }

  // Redirect to default step if no step provided
  if (!stepParam) {
    return redirect(getCheckoutUrl('delivery', isGuestCheckout));
  }

  // If no user and no session, redirect to home
  if (!user && !session_id) {
    redirect('/');
  }

  return <CheckoutPage />;
}
