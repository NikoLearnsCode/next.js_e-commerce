'use client';

import {useCart} from '@/context/CartProvider';
import DeliveryStep from '@/components/checkout/steps/DeliveryStep';
import PaymentStep from '@/components/checkout/steps/PaymentStep';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {GoArrowLeft} from 'react-icons/go';
import OrderSummary, {CampaignCodeButton} from './OrderSummary';
import OrderConfirmation from './steps/OrderConfirmation';
import Steps from './StepBar';
import {useState} from 'react';
import {DeliveryFormData} from '@/lib/validators';
import {ProductListMobile} from './ProductList';

export type CheckoutStep = 'delivery' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const {cartItems} = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = (searchParams.get('step') as CheckoutStep) || 'delivery';
  const isGuest = searchParams.get('guest') === 'true';
  const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(
    null
  );

  if (cartItems.length === 0) {
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

  return (
    <div className='max-w-5xl mx-auto px-4 py-8   '>
      <Steps currentStep={currentStep} />

      {/* main content */}
      <div className='flex flex-col md:flex-row gap-6 pb-16 pt-4 px-2 md:gap-20'>
        {/* mobile-only components  */}
        {currentStep !== 'confirmation' && (
          <div className='md:hidden space-y-6 py-3 md:pt-0'>
            <ProductListMobile />

            {currentStep === 'payment' && <CampaignCodeButton />}
          </div>
        )}

        {/* main step*/}
        <div className='flex-1'>
          {currentStep === 'delivery' && (
            <DeliveryStep
              onNext={handleSaveDeliveryData}
              initialData={deliveryData}
            />
          )}
          {currentStep === 'payment' && (
            <PaymentStep onNext={handleNext} deliveryData={deliveryData} />
          )}

          {currentStep === 'confirmation' && <OrderConfirmation />}
        </div>

        {/* desktop-only summary sidebar */}
        {currentStep !== 'confirmation' && (
          <div className='hidden md:block w-72'>
            <OrderSummary />
          </div>
        )}
      </div>
    </div>
  );
}
