'use client';
import {useCart} from '@/context/CartProvider';

import {Button} from '@/components/shared/button';

import {useState} from 'react';
import {Accordion} from '@/components/shared/Accordion';
import {FloatingLabelInput} from '@/components/shared/floatingLabelInput';
import {ProductListDesktop} from './ProductList';
import {formatPrice} from '@/lib/helpers';

export function CampaignCodeButton() {
  const [campaignCode, setCampaignCode] = useState('');

  const handleApplyCode = () => {
    if (!campaignCode.trim()) return;
  };

  return (
    <Accordion.Root
      type='single'
      collapsible={true}
      className={`text-sm my-3  md:my-0  overflow-hidden`}
      // defaultValue='campaignCode'
    >
      <Accordion.Item
        value='campaignCode'
        className='border overflow-hidden rounded-md transition-colors duration-200 data-[state=open]:border-black'
      >
        <Accordion.Trigger className='data-[state=open]:outline-none'>
          <h3 className='text-sm font-medium px-3 border-none'>
            LÄGG TILL KAMPANJKOD
          </h3>
        </Accordion.Trigger>
        <Accordion.Content className='p-3'>
          <FloatingLabelInput
            type='text'
            id='campaignCode'
            label='Kampanjkod'
            value={campaignCode}
            onChange={(e) => setCampaignCode(e.target.value)}
          />
          <Button
            type='button'
            variant='outline'
            className='w-full mt-2 border-gray-400 active:border-gray-600 hover:border-gray-600 shadow-none hover:bg-white'
            onClick={handleApplyCode}
          >
            Använd kod
          </Button>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

// Separate component for the order summary totals
export function OrderSummaryTotals() {
  const {totalPrice} = useCart();

  return (
    <div className=' space-y-2  pt-4'>
      <div className='flex justify-between text-sm'>
        <span>Delsumma</span>
        <span>{totalPrice} kr</span>
      </div>
      <div className='flex justify-between text-sm'>
        <span>Frakt</span>
        <span>Gratis</span>
      </div>
      <div className='flex justify-between pt-4 border-t'>
        <span>Totalsumma</span>
        <span className='font-medium'>{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}

// The main OrderSummary component for desktop view
export default function OrderSummary() {
  return (
    <div className='hidden md:block bg-white  '>
      <h2 className='text-lg font-medium mb-4'>Varukorg</h2>
      <div className='space-y-4 '>
        <CampaignCodeButton />
        <OrderSummaryTotals />
        <div className='border-t pt-6'>
          <ProductListDesktop />
        </div>
      </div>
    </div>
  );
}
