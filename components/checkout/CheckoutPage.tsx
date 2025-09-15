'use client';

import {useCart} from '@/context/CartProvider';
import {useCheckout} from '@/context/CheckoutProvider';
import DeliveryStep from '@/components/checkout/steps/DeliveryStep';
import PaymentStep from '@/components/checkout/steps/PaymentStep';

import OrderConfirmation from './steps/OrderConfirmation';
import Steps from './StepBar';
import CheckoutLayoutDesktop from './desktop/CheckoutLayoutDesktop';
import CheckoutLayoutMobile from './mobile/CheckoutLayoutMobile';
import {useMediaQuery} from '@/hooks/useMediaQuery';
import SpinningLoader from '@/components/shared/ui/SpinningLogo';
import {Toaster} from 'sonner';

export default function CheckoutPage() {
  const {loading} = useCart();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const {currentStep, deliveryData, completeDeliveryStep, completePaymentStep} =
    useCheckout();

  if (loading) {
    return (
      <div className='fixed inset-0 flex flex-col  mb-40 justify-center items-center'>
        <SpinningLoader height='40' className='opacity-30 pb-4' />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'delivery':
        return (
          <DeliveryStep
            onNext={completeDeliveryStep}
            initialData={deliveryData}
          />
        );
      case 'payment':
        return (
          <PaymentStep
            onNext={completePaymentStep}
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
      <Toaster />
    </div>
  );
}
