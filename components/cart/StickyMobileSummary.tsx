'use client';

import {motion} from 'framer-motion';
import {formatPrice} from '@/lib/helpers';
import {Link} from '@/components/shared/link';

type StickyMobileSummaryProps = {
  totalPrice: number;

  visible: boolean;
};

export default function StickyMobileSummary({
  totalPrice,

  visible,
}: StickyMobileSummaryProps) {
  return (
    <motion.div
      className='fixed bottom-0 left-0 right-0 z-1 bg-white border-t border-gray-100 shadow-lg p-3 lg:hidden'
      initial={{y: 100}}
      animate={{y: visible ? 0 : 100}}
      transition={{
        type: 'spring',
        bounce: 0.1,
        duration: 0.4,
      }}
    >
      <div className='flex justify-between gap-8 items-center px-4'>
        <div>
          <div className='flex  flex-col text-base'>
            <span className=' text-sm'>Totalsumma:</span>
            <span className=' text-base'>
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
        <Link
          href='/checkout'
          variant='primary'
          className='mt-2 w-1/2  h-11 text-sm lg:text-base font-medium'
        >
          Till kassan
        </Link>
      </div>
    </motion.div>
  );
}
