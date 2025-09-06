'use client';

import {ReactNode} from 'react';
import CampaignCodeSection from '../shared/CampaignCodeSection';
import OrderTotals from '../shared/OrderTotals';
import ProductListDesktop from './ProductListDesktop';

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

      {currentStep !== 'confirmation' && (
        <div className='w-72'>
          <div className='bg-white'>
            <h2 className='text-lg font-medium mb-4'>Varukorg</h2>
            <div className='space-y-4'>
              <CampaignCodeSection />
              <OrderTotals />
              <div className='border-t pt-6'>
                <ProductListDesktop />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
