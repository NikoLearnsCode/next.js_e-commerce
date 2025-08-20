'use client';

import {Link} from '@/components/shared/link';
import {formatPrice} from '@/lib/helpers';

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
            variant='secondary'
            size='md'
            width='full'
            className='mt-3 font-semibold text-xs md:text-sm h-8 md:h-9  '
            onClick={onCartClick}
          >
            Visa varukorg
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-between text-base lg:text-lg pr-2'>
        <span className='text-base lg:text-lg'>Totalsumma:</span>
        <span className='text-lg lg:text-xl'>{formatPrice(totalPrice)}</span>
      </div>
      <Link
        href='/checkout'
        variant='primary'
        width='full'
        className='mt-6 h-12 text-sm lg:text-base font-medium'
      >
        Till kassan
      </Link>
    </div>
  );
}
