'use client';

import Link from 'next/link';
import {GoArrowLeft} from 'react-icons/go';

export default function OrderConfirmation() {
  return (
    <div className='max-w-lg mx-auto px-4 pt-20 py-8 text-center'>
      <h1 className='text-3xl font-medium mb-2'>Tack för din beställning!</h1>
      <p className='font-normal text-lg mb-6'>
        Vi har tagit emot din order och kommer att behandla den så snart som
        möjligt.
      </p>

      <div className='mt-12'>
        <Link
          className='text-sm text-primary font-medium active:underline hover:underline flex justify-center gap-1  items-center mt-4 group tracking-wider mx-auto text-center'
          href='/'
        >
          <GoArrowLeft
            size={16}
            className='group-active:-translate-x-2 group-hover:-translate-x-2 transition-transform duration-300 mr-1'
          />
          Gå till startsidan
        </Link>
      </div>
    </div>
  );
}
