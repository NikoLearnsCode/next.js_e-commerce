'use client';

import {useCart} from '@/context/CartProvider';
import DeliveryStep from '@/components/checkout/steps/DeliveryStep';
import PaymentStep from '@/components/checkout/steps/PaymentStep';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {GoArrowLeft} from 'react-icons/go';
import OrderConfirmation from './steps/OrderConfirmation';
import Steps from './StepBar';
import {useState} from 'react';
import {DeliveryFormData} from '@/lib/validators';
import CheckoutLayoutDesktop from './desktop/CheckoutLayoutDesktop';
import CheckoutLayoutMobile from './mobile/CheckoutLayoutMobile';
import {useMediaQuery} from '@/hooks/useMediaQuery';

export type CheckoutStep = 'delivery' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const {cartItems, loading} = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = (searchParams.get('step') as CheckoutStep) || 'delivery';
  const isGuest = searchParams.get('guest') === 'true';
  const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(
    null
  );
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (cartItems.length === 0 && !loading) {
    return (
      <div className='flex flex-col justify-center items-center min-h-[calc(100vh-310px)]'>
        <h2 className='text-xl  text-gray-700'>Din varukorg är tom</h2>
        <Link
          className='text-sm text-primary font-medium active:underline hover:underline flex justify-center gap-1 items-center mt-4 group tracking-wider mx-auto text-center'
          href='/'
        >
          <GoArrowLeft
            size={16}
            className='group-active:-translate-x-2 group-hover:-translate-x-2 transition-transform duration-300 mr-1'
          />
          Fortsätt handla
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    let nextPath = '';
    if (currentStep === 'delivery') nextPath = '/checkout?step=payment';
    else if (currentStep === 'payment')
      nextPath = '/checkout?step=confirmation';

    if (isGuest) {
      nextPath += '&guest=true';
    }

    router.push(nextPath);
  };

  const handleSaveDeliveryData = (data: DeliveryFormData) => {
    setDeliveryData(data);
    handleNext();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'delivery':
        return (
          <DeliveryStep
            onNext={handleSaveDeliveryData}
            initialData={deliveryData}
          />
        );
      case 'payment':
        return <PaymentStep onNext={handleNext} deliveryData={deliveryData} />;
      case 'confirmation':
        return <OrderConfirmation />;
      default:
        return null;
    }
  };

  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
      <Steps currentStep={currentStep} />

      {/* Responsive layout */}
      {isDesktop ? (
        <CheckoutLayoutDesktop currentStep={currentStep}>
          {renderStepContent()}
        </CheckoutLayoutDesktop>
      ) : (
        <CheckoutLayoutMobile currentStep={currentStep}>
          {renderStepContent()}
        </CheckoutLayoutMobile>
      )}
    </div>
  );
}
