import {Metadata} from 'next';
import CheckoutPage from '@/components/checkout/CheckoutPage';
import {redirect} from 'next/navigation';
import {createClient} from '@/utils/supabase/server';


export const metadata: Metadata = {
  title: 'Checkout',
};

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();

  const params = await searchParams;

  const stepValue = Array.isArray(params.step)
    ? params.step[0]
    : params.step || 'delivery';

  const isGuestCheckout = params.guest === 'true';

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if ((error || !user) && !isGuestCheckout) {
    return redirect(
      `/sign-in?callbackUrl=/checkout?step=${stepValue}&source=checkout`
    );
  }

  if (!params.step) {
    redirect('/checkout?step=delivery');
  }

  return (
    <CheckoutPage />
  );
}
