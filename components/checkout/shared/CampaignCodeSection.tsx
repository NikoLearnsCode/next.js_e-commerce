'use client';

import {useState} from 'react';
import {Button} from '@/components/shared/button';
import {Accordion} from '@/components/shared/Accordion';
import {FloatingLabelInput} from '@/components/shared/floatingLabelInput';

export default function CampaignCodeSection() {
  const [campaignCode, setCampaignCode] = useState('');

  const handleApplyCode = () => {
    if (!campaignCode.trim()) return;
    // TODO: Implement campaign code logic
  };

  return (
    <Accordion.Root
      type='single'
      collapsible={true}
      className='text-sm my-3 md:my-0 overflow-hidden'
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
