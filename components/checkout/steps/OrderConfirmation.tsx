'use client';

import Link from 'next/link';
import {GoArrowLeft} from 'react-icons/go';
import {useEffect} from 'react';
import {CreateOrderResult, CartItemWithProduct} from '@/lib/types/db-types';
import Image from 'next/image';
import {formatPrice} from '@/utils/formatPrice';

interface OrderConfirmationProps {
  order: CreateOrderResult | null;
  orderSnapshot: {
    items: CartItemWithProduct[];
    totalPrice: number;
  } | null;
  clearCart: () => Promise<void>;
}

export default function OrderConfirmation({
  orderSnapshot,
  clearCart,
}: OrderConfirmationProps) {
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className='max-w-3xl mx-auto  sm:pt-5 pt-2 py-8 text-center'>
      <h1 className='text-xl sm:text-2xl font-medium mb-2'>
        Tack för din beställning!
      </h1>
      <p className='font-normal text-[15px] sm:text-base mb-12'>
        Vi har tagit emot din order och kommer att behandla den så snart som
        möjligt.
      </p>
      {/*  {order && order.success && (
        <p className='text-sm text-gray-600 mb-6'>
          Ordernummer: {order.orderId}
        </p>
      )} */}

      {/* Order Items */}
      {orderSnapshot && orderSnapshot.items.length > 0 && (
        <div className=' mx-auto mb-4 '>
          {/*   <h3 className='text-lg font-medium mb-4 text-center'>
            Din beställning
          </h3> */}

          {/*  <div className='flex  items-center justify-center  gap-1 mb-8'>
              <span className='font-medium'>Totalt:</span>
              <span className='font-medium text-lg'>
                {formatPrice(orderSnapshot.totalPrice)}
              </span>
            </div> */}

          <div className='grid grid-cols-2   md:grid-cols-3 gap-1 '>
            {orderSnapshot.items.map((item) => (
              <div
                key={`${item.product_id}-${item.size}-${item.color}`}
                className='flex relative flex-col w-full h-full pb-6 group'
              >
                <div className='w-full relative bg-white aspect-[7/9]'>
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    priority
                    loading='eager'
                    className='object-cover'
                    sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw'
                  />
                </div>

                <div className=' text-xs pt-0.5  px-4 justify-start flex flex-col items-start'>
                  <h2 className=' font-medium'>{item.name}</h2>
                  <p className=' text-gray-700 '>
                    {formatPrice(item.price)} x {item.quantity}{' '}
                  </p>
                  <div className='  flex gap-2    text-gray-700 mt-1'>
                    <div>{item.size},</div>
                    <div>{item.color}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='mt-2'>
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
