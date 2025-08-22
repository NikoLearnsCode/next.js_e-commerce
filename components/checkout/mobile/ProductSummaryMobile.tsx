'use client';

import CampaignCodeSection from '../shared/CampaignCodeSection';

interface ProductSummaryMobileProps {
  currentStep: string;
}

export default function ProductSummaryMobile({
  currentStep,
}: ProductSummaryMobileProps) {
  // Only show campaign code on payment step
  if (currentStep !== 'payment') return null;

  return (
    <div className='py-3'>
      <CampaignCodeSection />
    </div>
  );
}
