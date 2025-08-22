'use client';

import {Link} from '@/components/shared/link';
import {formatPrice} from '@/utils/helpers';
import {getCheckoutUrl} from '@/lib/checkoutSteps';

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
    <div>
      <div className='flex justify-between text-base lg:text-lg pr-2'>
        <span className='text-base lg:text-lg'>Totalsumma:</span>
        <span className='text-lg lg:text-xl'>{formatPrice(totalPrice)}</span>
      </div>
      <Link
        href={getCheckoutUrl('delivery')}
        variant='primary'
        width='full'
        className='mt-6 h-12 text-sm lg:text-base font-medium'
      >
        Till kassan
      </Link>
    </div>
  );
}
