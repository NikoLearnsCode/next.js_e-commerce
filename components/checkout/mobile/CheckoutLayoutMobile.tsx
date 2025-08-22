'use client';

import {ReactNode} from 'react';
import ProductListMobile from './ProductListMobile';
import ProductSummaryMobile from './ProductSummaryMobile';

interface CheckoutLayoutMobileProps {
  children: ReactNode;
  currentStep: string;
}

export default function CheckoutLayoutMobile({
  children,
  currentStep,
}: CheckoutLayoutMobileProps) {
  return (
    <div className='flex flex-col gap-6 pb-16 pt-4 px-2'>
      {/* mobile-only components - hidden on confirmation step */}
      {currentStep !== 'confirmation' && (
        <div className='space-y-6 py-3 md:pt-0'>
          <ProductListMobile />
          <ProductSummaryMobile currentStep={currentStep} />
        </div>
      )}

      {/* main step content */}
      <div className='flex-1'>{children}</div>
    </div>
  );
}
