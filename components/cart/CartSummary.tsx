'use client';

import {Link} from '@/components/shared/ui/link';
import {formatPrice} from '@/utils/format';

type CartSummaryProps = {
  totalPrice: number;
  compact?: boolean;
  onCartClick?: () => void;
};

export default function CartSummary({
  totalPrice,
  compact = false,
  onCartClick = () => {},
}: CartSummaryProps) {
  if (compact) {
    return (
      <div className='p-3 border-t border-gray-100'>
        <div className='flex justify-between items-center'>
          <span className='font-syne text-xs md:text-sm'>Totalsumma:</span>
          <span className='font-medium text-xs md:text-base'>
            {formatPrice(totalPrice)}
          </span>
        </div>
        <div className='flex'>
          <Link
            href='/cart'
            variant='outline'
            size='md'
            width='full'
            className='mt-3 font-semibold text-xs md:text-sm h-8 md:h-10  '
            onClick={onCartClick}
          >
            Visa varukorg
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className=''>
      <div className='flex justify-between flex-col gap-2 text-sm lg:text-lg pr-2'>
        <span className='text-sm flex justify-between'>
          Delsumma <span>{formatPrice(totalPrice)}</span>
        </span>
        <span className='text-sm flex justify-between'>
          Frakt <span className=''>Gratis</span>
        </span>
        <span className='text-sm font-medium flex justify-between'>
          Totalsumma{' '}
          <span className='text-base font-semibold'>
            {formatPrice(totalPrice)}
          </span>
        </span>
      </div>
      <Link
        href='/checkout'
        variant='primary'
        width='full'
        className='mt-6 h-15 text-sm lg:text-sm font-medium'
      >
        Till kassan
      </Link>
    </div>
  );
}
