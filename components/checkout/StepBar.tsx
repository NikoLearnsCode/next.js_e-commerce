'use client';
import Logo from '@/components/shared/Logo';
type Step = {
  key: string;
  label: string;
};
const steps: Step[] = [
  {key: 'delivery', label: 'Frakt'},
  {key: 'payment', label: 'Betalning'},
  {key: 'confirmation', label: 'Bekräftelse'},
];

export default function Steps({currentStep}: {currentStep: string}) {
  const currentStepIndex = steps.findIndex((s: Step) => s.key === currentStep);
  const allStepsDone = currentStepIndex >= steps.length - 1;

  return (
    <>
      <div className='absolute top-4 right-1/2 pr-1'>
        {currentStep === 'confirmation' ? (
          <Logo href='/' />
        ) : (
          <Logo href='/cart' />
        )}
      </div>

      <div className=''>
        <div className='max-w-2xl mx-auto'>
          <div className='relative flex justify-between px-4 mb-8 md:px-0'>
            <div className='transition absolute top-3 left-11 right-11 md:left-5 md:right-5 h-0.5 bg-gray-200' />

            {steps.map((step, index) => {
              let circleClasses =
                'w-6 h-6 text-xs font-medium rounded-full flex items-center justify-center relative z-10';

              let content: number | string = index + 1;

              if (allStepsDone) {
                circleClasses += ' bg-white border shadow-xs text-black';
                content = '✓';
              } else {
                if (index < currentStepIndex) {
                  circleClasses += ' bg-white border shadow-xs text-black';
                  content = '✓';
                } else if (index === currentStepIndex) {
                  circleClasses += ' bg-black text-white';
                } else {
                  circleClasses += ' bg-white border shadow-xs text-black';
                }
              }

              return (
                <div
                  key={step.key}
                  className='flex flex-col items-center relative'
                >
                  <div className={circleClasses}>{content}</div>
                  <span className='mt-2 text-xs font-medium'>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
