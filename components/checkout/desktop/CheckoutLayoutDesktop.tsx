'use client';

import {ReactNode} from 'react';
import OrderSummaryDesktop from './OrderSummaryDesktop';

interface CheckoutLayoutDesktopProps {
  children: ReactNode;
  currentStep: string;
}

export default function CheckoutLayoutDesktop({
  children,
  currentStep,
}: CheckoutLayoutDesktopProps) {
  return (
    <div className='flex flex-row gap-6 pb-16 pt-4 px-2 md:gap-20'>
      {/* main step content */}
      <div className='flex-1'>{children}</div>

      {/* desktop sidebar - hidden on confirmation step */}
      {currentStep !== 'confirmation' && (
        <div className='w-72'>
          <OrderSummaryDesktop />
        </div>
      )}
    </div>
  );
}
