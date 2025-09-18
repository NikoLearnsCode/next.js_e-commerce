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
import {DeliveryFormData} from '@/lib/validators/checkout-validators';

// Checkout steps - en enda source of truth
export const STEP_INFO = {
  delivery: 'Frakt',
  payment: 'Betalning',
  confirmation: 'Bekräftelse',
} as const;

export type CheckoutStep = keyof typeof STEP_INFO;
export const CHECKOUT_STEPS = Object.keys(STEP_INFO) as CheckoutStep[];

// Enkel step-validering: kan bara gå till nästa steg om föregående är klart
const canAccessStep = (
  step: CheckoutStep,
  completedSteps: CheckoutStep[]
): boolean => {
  if (step === 'delivery') return true;
  if (step === 'payment') return completedSteps.includes('delivery');
  if (step === 'confirmation') return completedSteps.includes('payment');
  return false;
};

// Byggare checkout URL
const getCheckoutUrl = (step: CheckoutStep, isGuest?: boolean): string => {
  return `/checkout?step=${step}${isGuest ? '&guest=true' : ''}`;
};

// Validera step från URL - om inte tillåtet, gå till senaste möjliga
const validateStep = (
  urlStep: string | null,
  completedSteps: CheckoutStep[]
): CheckoutStep => {
  const step = urlStep as CheckoutStep;

  // Om ogiltig step, börja med delivery
  if (!CHECKOUT_STEPS.includes(step)) {
    return 'delivery';
  }

  // Om kan inte komma åt steget, gå till senaste tillåtna
  if (!canAccessStep(step, completedSteps)) {
    if (completedSteps.includes('delivery')) return 'payment';
    return 'delivery';
  }

  return step;
};

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
