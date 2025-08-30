'use client';

import {useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useCart} from '@/context/CartProvider';
import DeliveryStep from '@/components/checkout/steps/DeliveryStep';
import PaymentStep from '@/components/checkout/steps/PaymentStep';

import OrderConfirmation from './steps/OrderConfirmation';
import Steps from './StepBar';
import CheckoutLayoutDesktop from './desktop/CheckoutLayoutDesktop';
import CheckoutLayoutMobile from './mobile/CheckoutLayoutMobile';
import {useMediaQuery} from '@/hooks/useMediaQuery';
import {DeliveryFormData} from '@/lib/validators';
import {
  CheckoutStep,
  validateStep,
  getCheckoutUrl,
} from '@/components/checkout/utils/steps';
import SpinningLoader from '@/components/shared/ui/SpinningLogo';

export default function CheckoutPage() {
  const {loading} = useCart();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(
    null
  );

  // URL state
  const stepParam = searchParams.get('step');
  const isGuest = searchParams.get('guest') === 'true';

  // Validerat aktuellt steg
  const currentStep = validateStep(stepParam, completedSteps);

  // Navigation functions
  const saveDeliveryAndProceed = (data: DeliveryFormData) => {
    setDeliveryData(data);
    setCompletedSteps((prev) => [...prev, 'delivery']);
    router.push(getCheckoutUrl('payment', isGuest));
  };

  const completePaymentAndProceed = () => {
    setCompletedSteps((prev) => [...prev, 'payment']);
    router.push(getCheckoutUrl('confirmation', isGuest));
  };

  //  förhindra layout shift
  if (loading) {
    return (
      <div className='absolute inset-0 flex flex-col  mb-20 justify-center items-center'>
        <SpinningLoader height='40' className='opacity-50 pb-4' />
        <span className='text-xs pl-1 font-semibold uppercase font-syne text-gray-400 '>
          Laddar...
        </span>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'delivery':
        return (
          <DeliveryStep
            onNext={saveDeliveryAndProceed}
            initialData={deliveryData}
          />
        );
      case 'payment':
        return (
          <PaymentStep
            onNext={completePaymentAndProceed}
            deliveryData={deliveryData}
          />
        );
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
