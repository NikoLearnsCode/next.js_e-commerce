'use client';

import Link from 'next/link';
import {GoArrowLeft} from 'react-icons/go';

type EmptyCartProps = {
  compact?: boolean;
  onCartClick?: () => void;
};

export default function EmptyCart({compact = false}: EmptyCartProps) {
  if (compact) {
    return (
      <div className='p-4 text-center'>
        <p className='text-sm text-gray-700 mb-1'>Din varukorg är tom.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center items-center min-h-[calc(100vh-310px)]'>
      <h2 className='text-xl  text-gray-700'>Din varukorg är tom.</h2>

      <Link
        className='text-sm text-primary font-medium active:underline hover:underline flex justify-center gap-1 items-center mt-4 group tracking-wider mx-auto text-center'
        href='/'
      >
        <GoArrowLeft
          size={16}
          className='group-active:-translate-x-2 group-hover:-translate-x-2 transition-transform duration-300 mr-1'
        />
        Fortsätt handla
      </Link>
    </div>
  );
}
