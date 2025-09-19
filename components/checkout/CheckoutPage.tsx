'use client';

import {useCart} from '@/context/CartProvider';
import {useCheckout} from '@/context/CheckoutProvider';
import DeliveryStep from '@/components/checkout/steps/DeliveryStep';
import PaymentStep from '@/components/checkout/steps/PaymentStep';

import OrderConfirmation from './steps/OrderConfirmation';
import Steps from './StepBar';
import CheckoutLayoutDesktop from './desktop/CheckoutLayoutDesktop';
import CheckoutLayoutMobile from './mobile/CheckoutLayoutMobile';
// import {useMediaQuery} from '@/hooks/useMediaQuery';
import SpinningLoader from '@/components/shared/ui/SpinningLogo';
import {Toaster} from 'sonner';

export default function CheckoutPage() {
  const {loading, clearCart} = useCart();
  // const isDesktop = useMediaQuery('(min-width: 768px)');
  const {
    currentStep,
    deliveryData,
    completedOrder,
    orderSnapshot,
    completeDeliveryStep,
    completePaymentStep,
  } = useCheckout();

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
        return (
          <OrderConfirmation
            order={completedOrder}
            orderSnapshot={orderSnapshot}
            clearCart={clearCart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
      <Steps currentStep={currentStep} />

      {/* {isDesktop ? ( */}
      <div className='hidden md:block'>
        <CheckoutLayoutDesktop currentStep={currentStep}>
          {renderStepContent()}
        </CheckoutLayoutDesktop>
      </div>
      {/* ) : ( */}
      <div className='block md:hidden'>
        <CheckoutLayoutMobile currentStep={currentStep}>
          {renderStepContent()}
        </CheckoutLayoutMobile>
      </div>
      {/* )} */}
      <Toaster />
    </div>
  );
}
