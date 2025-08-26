

import {Metadata} from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Access Denied',
};

export default async function Denied() {
  return (
    <div className='flex -mt-[56px] flex-col items-center pb-32 justify-center h-screen'>
      <h1 className='text-3xl uppercase font-syne font-semibold'>
        ACCESS DENIED
      </h1>
      <Link
        href='/'
        className='mt-4 font-syne font-semibold text-base underline underline-offset-2'
      >
        GTFO
      </Link>

      
    </div>
  );
}
