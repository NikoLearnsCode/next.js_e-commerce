/** Enkel checkout utilities */

const STEPS = [
  {
    key: 'delivery' as const,
    label: 'Frakt',
    requires: null,
    next: 'payment' as const,
  },
  {
    key: 'payment' as const,
    label: 'Betalning',
    requires: 'delivery' as const,
    next: 'confirmation' as const,
  },
  {
    key: 'confirmation' as const,
    label: 'Bekräftelse',
    requires: 'payment' as const,
    next: null,
  },
] as const;

export type CheckoutStep = (typeof STEPS)[number]['key'];

export const getStepsArray = () => STEPS;

const getStepConfig = (step: CheckoutStep) => STEPS.find((s) => s.key === step);

/**
 * Kollar om användaren kan komma åt ett steg
 * @param step Steg att kontrollera
 * @param completed Lista över genomförda steg
 */
export const canAccessStep = (
  step: CheckoutStep,
  completed: CheckoutStep[]
) => {
  const config = getStepConfig(step);
  return (
    !config || config.requires === null || completed.includes(config.requires)
  );
};

/**
 * Bygger checkout URL
 * @param step Vilket steg
 * @param isGuest Om användaren är gäst
 */
export const getCheckoutUrl = (step: CheckoutStep, isGuest?: boolean) =>
  `/checkout?step=${step}${isGuest ? '&guest=true' : ''}`;

/**
 * Validerar URL step param och returnerar tillåtet steg
 * @param urlStep Step från URL
 * @param completed Genomförda steg
 */
export const validateStep = (
  urlStep: string | null,
  completed: CheckoutStep[]
): CheckoutStep => {
  // Ingen step eller ogiltig step
  const validSteps = STEPS.map((s) => s.key);
  if (!urlStep || !validSteps.includes(urlStep as CheckoutStep)) {
    return 'delivery';
  }

  const step = urlStep as CheckoutStep;

  // Om användaren inte kan komma åt steget, hitta senaste tillgängligt
  if (!canAccessStep(step, completed)) {
    if (completed.includes('delivery')) {
      return 'payment';
    }
    return 'delivery';
  }

  return step;
};

/**
 * Hämtar nästa steg
 * @param currentStep Aktuellt steg
 */
export const getNextStep = (currentStep: CheckoutStep): CheckoutStep | null => {
  const config = getStepConfig(currentStep);
  return config?.next || null;
};
