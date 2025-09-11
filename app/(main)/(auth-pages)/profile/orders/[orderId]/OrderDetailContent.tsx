'use client';

import Image from 'next/image';
import {ArrowLeft} from 'lucide-react';

import type {OrderWithItems} from '@/lib/types/db';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
import Link from 'next/link';

import {formatPrice} from '@/utils/format';

interface OrderDetailContentProps {
  order: OrderWithItems;
}

export default function OrderDetailContent({order}: OrderDetailContentProps) {
  return (
    <AnimatedAuthContainer direction='right' className='max-w-5xl w-full'>
      {/* Header */}
      <div className='px-5 mb-8'>
        <Link
          className='text-xs   mb-8 text-primary font-medium hover:underline inline-flex flex-row-reverse gap-2 group tracking-wider'
          href='/profile/orders'
        >
          Tillbaka
          <ArrowLeft
            size={16}
            strokeWidth={1.5}
            className='group-hover:-translate-x-1 transition-transform duration-300'
          />
        </Link>

        <h1 className='text-lg  font-semibold text-gray-900 '>ORDERDETALJER</h1>
      </div>

      <div className=''>
        <div className='grid md:grid-cols-2 '>
          {/* Left Side - Order Information */}
          <div className='space-y-8 px-5 '>
            {/* Order Details */}
            <div>
              <h2 className='text-base font-medium mb-2 text-gray-900'>
                BESTÄLLNINGSNR
              </h2>
              <p className='text-gray-600 text-[15px]'>{order.id}</p>
            </div>

            {/* Purchase Date */}
            <div>
              <h2 className='text-base font-medium mb-2 text-gray-900'>
                KÖPDATUM
              </h2>
              <p className='text-gray-800 text-[15px]'>
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString('sv-SE')
                  : 'Okänt datum'}
              </p>
            </div>

            {/* Delivery Information */}
            {order.delivery_info && (
              <div>
                <h2 className='text-base font-medium mb-2 text-gray-900'>
                  LEVERANSUPPGIFTER
                </h2>
                <div className='space-y-1 text-[15px]   text-gray-800'>
                  <p>
                    {order.delivery_info.firstName}{' '}
                    {order.delivery_info.lastName}
                  </p>
                  <p>{order.delivery_info.address}</p>
                  <p>
                    {order.delivery_info.postalCode} {order.delivery_info.city}
                  </p>
                  {order.delivery_info.phone && (
                    <p>{order.delivery_info.phone}</p>
                  )}
                  {order.delivery_info.email && (
                    <p>{order.delivery_info.email}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Product Images */}
          <div>
            <h2 className='text-base  px-5 md:px-0 font-medium mt-10 md:mt-0 mb-6 text-gray-900'>
              ARTIKLAR ({order.order_items.length})
            </h2>
            <div className='space-y-1'>
              {order.order_items.map((item) => (
                /*   <div
                  key={`${item.product_id}-${item.size || index}`}
                  className='flex '
                > */
                <div key={`${item.id}`} className='flex '>
                  {/* Product Image */}
                  <div className='relative aspect-[7/9] min-w-2/3'>
                    {item.image ? (
                      <Link
                        href={`/${item.slug}`}
                        className=' w-full h-full cursor-pointer'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className='object-cover w-full h-full'
                        />
                      </Link>
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-gray-400'>
                        <span className='text-xs'>Ingen bild</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className='min-w-1/3 text-xs md:text-sm py-2 px-4'>
                    <Link href={`/${item.slug}`}>
                      <h3 className='font-medium text-gray-900 mb-2 hover:text-gray-700 transition-colors cursor-pointer'>
                        {item.name}
                      </h3>
                    </Link>
                    <div className='space-y-1  text-gray-600'>
                      <p>Artikel-ID: {item.product_id?.substring(0, 8)}</p>
                      {item.size && <p>Storlek: {item.size}</p>}
                      {item.color && <p>Färg: {item.color}</p>}
                      <p>Antal: {item.quantity}</p>
                      <p>Pris: {formatPrice(item.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Order Summary */}

        <div className='float-right pb-10 border-t border-gray-200 px-5 lg:px-0  w-full md:w-[50%] p-3 mt-7'>
          <h3 className='text-base pt-5  font-medium mb-4 text-gray-900'>
            SAMMANFATTNING AV BESTÄLLNING
          </h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-gray-700'>Delsumma</span>
              <span className='text-gray-900'>
                {formatPrice(order.total_amount)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-700'>Frakt</span>
              <span className='text-gray-900'>Gratis</span>
            </div>
            <div className=' pt-1'>
              <div className='flex justify-between  font-bold'>
                <span className='text-gray-900'>Totalsumma</span>
                <span className='text-gray-900'>
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedAuthContainer>
  );
}
