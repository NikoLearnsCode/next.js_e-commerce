'use client';

import Image from 'next/image';
import {ArrowLeft} from 'lucide-react';

import type {OrderWithItems, DeliveryFormData} from '@/lib/validators';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
import {Link} from '@/components/shared/ui/link';

interface OrderDetailContentProps {
  order: OrderWithItems;
}

// Helper function to format currency
function formatPrice(price: string | number | undefined | null): string {
  if (price === undefined || price === null) {
    return '-';
  }
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
  }).format(numPrice);
}

export default function OrderDetailContent({order}: OrderDetailContentProps) {
  // Type assertion för delivery_info eftersom det kommer som unknown från databasen, tillfällig fix
  const deliveryInfo = order.delivery_info as DeliveryFormData;
  return (
    <AnimatedAuthContainer direction='right' className='max-w-4xl w-full'>
      {/* Header */}
      <div className=' mb-8'>
        <Link
          className='text-xs  mb-5 text-primary font-medium hover:underline inline-flex flex-row-reverse gap-2 group tracking-wider'
          href='/profile/orders'
        >
          Tillbaka
          <ArrowLeft
            size={16}
            strokeWidth={1.5}
            className='group-hover:-translate-x-1 transition-transform duration-300'
          />
        </Link>

        <h1 className='text-2xl px-4 font-bold text-gray-900 '>
          ORDERDETALJER
        </h1>
      </div>

      <div className='px-4'>
        <div className='grid lg:grid-cols-2 gap-12'>
          {/* Left Side - Order Information */}
          <div className='space-y-8'>
            {/* Order Details */}
            <div>
              <h2 className='text-lg font-medium mb-4 text-gray-900'>
                BESTÄLLNINGSNR
              </h2>
              <p className='text-gray-700'>{order.id}</p>
            </div>

            {/* Purchase Date */}
            <div>
              <h2 className='text-lg font-medium mb-4 text-gray-900'>
                KÖPDATUM
              </h2>
              <p className='text-gray-700'>
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString('sv-SE')
                  : 'Okänt datum'}
              </p>
            </div>

            {/* Delivery Information */}
            {deliveryInfo && (
              <div>
                <h2 className='text-lg font-medium mb-4 text-gray-900'>
                  LEVERANSUPPGIFTER
                </h2>
                <div className='space-y-1 text-gray-700'>
                  <p>
                    {deliveryInfo.firstName} {deliveryInfo.lastName}
                  </p>
                  <p>{deliveryInfo.address}</p>
                  <p>
                    {deliveryInfo.postalCode} {deliveryInfo.city}
                  </p>
                  {deliveryInfo.phone && <p>{deliveryInfo.phone}</p>}
                  {deliveryInfo.email && <p>{deliveryInfo.email}</p>}
                </div>
              </div>
            )}

            {/* Invoice Information */}
            <div>
              <h2 className='text-lg font-medium mb-4 text-gray-900'>
                FAKTURAUPPGIFTER
              </h2>
              <div className='space-y-1 text-gray-700'>
                {deliveryInfo && (
                  <>
                    <p>
                      {deliveryInfo.firstName} {deliveryInfo.lastName}
                    </p>
                    <p>{deliveryInfo.address}</p>
                    <p>
                      {deliveryInfo.postalCode} {deliveryInfo.city}
                    </p>
                    {deliveryInfo.phone && <p>{deliveryInfo.phone}</p>}
                    {deliveryInfo.email && <p>{deliveryInfo.email}</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Product Images */}
          <div>
            <h2 className='text-lg font-medium mb-6 text-gray-900'>ARTIKLAR</h2>
            <div className='space-y-6'>
              {order.order_items.map((item, index) => (
                <div
                  key={`${item.product_id}-${item.size || index}`}
                  className='flex items-start space-x-4'
                >
                  {/* Product Image */}
                  <div className='w-32 h-40 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0'>
                    {item.image ? (
                      <Link
                        href={`/${item.slug}`}
                        className='block w-full h-full'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={128}
                          height={160}
                          className='object-cover w-full h-full hover:scale-105 transition-transform duration-200'
                        />
                      </Link>
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-gray-400'>
                        <span className='text-xs'>Ingen bild</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className='flex-grow'>
                    <Link href={`/${item.slug}`}>
                      <h3 className='font-medium text-gray-900 mb-2 hover:text-gray-700 transition-colors cursor-pointer'>
                        {item.name}
                      </h3>
                    </Link>
                    <div className='space-y-2 text-sm text-gray-600'>
                      <p>Artikel-ID: {item.product_id?.substring(0, 8)}</p>
                      {item.size && <p>Storlek: {item.size}</p>}
                      {item.color && <p>Färg: {item.color}</p>}
                      <p>Antal: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className='mt-4'>
                      <span className='font-medium text-gray-900'>
                        {formatPrice(parseFloat(item.price) * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <span className='text-sm text-gray-500 ml-2'>
                          ({formatPrice(item.price)}/st)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Order Summary */}
        <div className='mt-8 pt-4 pb-12 border-t border-gray-200'>
          <div className=' mx-auto   rounded-lg'>
            <h3 className='text-lg font-medium mb-4 text-gray-900'>
              SAMMANFATTNING AV BESTÄLLNING
            </h3>
            <div className='space-y-3'>
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
              <div className='border-t border-gray-200 pt-3'>
                <div className='flex justify-between text-lg font-bold'>
                  <span className='text-gray-900'>Totalsumma</span>
                  <span className='text-gray-900'>
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedAuthContainer>
  );
}
