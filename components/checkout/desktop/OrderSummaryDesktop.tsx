'use client';

import CampaignCodeSection from '../shared/CampaignCodeSection';
import OrderTotals from '../shared/OrderTotals';
import ProductListDesktop from './ProductListDesktop';

export default function OrderSummaryDesktop() {
  return (
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
  );
}
