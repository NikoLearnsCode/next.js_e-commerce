'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useCart} from '@/context/CartProvider';
import {DeliveryFormData} from '@/lib/validators';
import {
  CheckoutStep,
  validateStep,
  getCheckoutUrl,
} from '@/components/checkout/utils/steps';

interface CheckoutContextType {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  deliveryData: DeliveryFormData | null;
  isGuest: boolean;

  completeDeliveryStep: (data: DeliveryFormData) => void;
  completePaymentStep: () => void;
  goToStep: (step: CheckoutStep) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export function CheckoutProvider({children}: {children: ReactNode}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {cartItems, loading} = useCart();

  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(
    null
  );

  const stepParam = searchParams.get('step');
  const isGuest = searchParams.get('guest') === 'true';

  const currentStep = validateStep(stepParam, completedSteps);

  const completeDeliveryStep = useCallback(
    (data: DeliveryFormData) => {
      setDeliveryData(data);
      setCompletedSteps((prev) => [...prev, 'delivery']);
      router.push(getCheckoutUrl('payment', isGuest));
    },
    [router, isGuest]
  );

  const completePaymentStep = useCallback(() => {
    setCompletedSteps((prev) => [...prev, 'payment']);
    router.push(getCheckoutUrl('confirmation', isGuest));
  }, [router, isGuest]);

  const goToStep = useCallback(
    (step: CheckoutStep) => {
      router.push(getCheckoutUrl(step, isGuest));
    },
    [router, isGuest]
  );

  const resetCheckout = useCallback(() => {
    setCompletedSteps([]);
    setDeliveryData(null);
    router.push(getCheckoutUrl('delivery', isGuest));
  }, [router, isGuest]);

  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      router.push('/cart');
      return;
    }
  }, [loading, cartItems.length, router]);

  useEffect(() => {
    if (!loading && cartItems.length > 0 && !stepParam) {
      router.push(getCheckoutUrl('delivery', isGuest));
    }
  }, [stepParam, router, isGuest, loading, cartItems.length]);

  if (loading) {
    return null;
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        completedSteps,
        deliveryData,
        isGuest,
        completeDeliveryStep,
        completePaymentStep,
        goToStep,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
