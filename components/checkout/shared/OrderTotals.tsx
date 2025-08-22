'use client';

import {useCart} from '@/context/CartProvider';
import {formatPrice} from '@/utils/helpers';

export default function OrderTotals() {
  const {totalPrice} = useCart();

  return (
    <div className='space-y-2 pt-4'>
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
