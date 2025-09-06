'use client';

import {ReactNode} from 'react';
import ProductListMobile from './ProductListMobile';
import CampaignCodeSection from '../shared/CampaignCodeSection';

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
      {currentStep !== 'confirmation' && (
        <div className='space-y-6 py-3 '>
          <ProductListMobile />

          {currentStep === 'payment' && (
            <div className='pt-4'>
              <CampaignCodeSection />
            </div>
          )}
        </div>
      )}

      {/* main step content */}
      <div className='flex-1'>{children}</div>
    </div>
  );
}
