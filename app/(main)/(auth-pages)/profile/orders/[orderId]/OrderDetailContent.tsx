'use client';

import Image from 'next/image';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
import {Link} from '@/components/shared/link';
import {ArrowLeft} from 'lucide-react';

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  price: string;
  name: string;
  size?: string;
  color?: string;
  image?: string;
};

type Order = {
  id: string;
  created_at: Date | null;
  total_amount?: string;
  status: string;
  delivery_info: any;
  payment_info: string;
  order_items: OrderItem[];
};

interface OrderDetailContentProps {
  order: Order;
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
  return (
    <AnimatedAuthContainer direction='up' className='max-w-7xl w-full'>
      {/* Header */}
      <div className='px-4 mb-8'>
        <Link
          href='/profile/orders'
          className='inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6'
        >
          <ArrowLeft size={16} />
          <span>Tillbaka</span>
        </Link>

        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
          UPPGIFTER OM KÖPET
        </h1>
        <p className='text-gray-600'>
          Du har returnerat några av varorna i din beställning. Kom ihåg att
          återbetalningar görs via samma betalningsmetod som användes vid köpet.
        </p>
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
            {order.delivery_info && (
              <div>
                <h2 className='text-lg font-medium mb-4 text-gray-900'>
                  LEVERANSUPPGIFTER
                </h2>
                <div className='space-y-1 text-gray-700'>
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

            {/* Invoice Information */}
            <div>
              <h2 className='text-lg font-medium mb-4 text-gray-900'>
                FAKTURAUPPGIFTER
              </h2>
              <div className='space-y-1 text-gray-700'>
                {order.delivery_info && (
                  <>
                    <p>
                      {order.delivery_info.firstName}{' '}
                      {order.delivery_info.lastName}
                    </p>
                    <p>{order.delivery_info.address}</p>
                    <p>
                      {order.delivery_info.postalCode}{' '}
                      {order.delivery_info.city}
                    </p>
                    {order.delivery_info.phone && (
                      <p>{order.delivery_info.phone}</p>
                    )}
                    {order.delivery_info.email && (
                      <p>{order.delivery_info.email}</p>
                    )}
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
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={128}
                        height={160}
                        className='object-contain w-full h-full'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-gray-400'>
                        <span className='text-xs'>Ingen bild</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className='flex-grow'>
                    <h3 className='font-medium text-gray-900 mb-2'>
                      {item.name}
                    </h3>
                    <div className='space-y-1 text-sm text-gray-600'>
                      <p>REF: {item.product_id.substring(0, 8)}</p>
                      {item.size && (
                        <div className='flex items-center space-x-2'>
                          <div className='w-4 h-4 bg-gray-800 rounded-full'></div>
                          <span>{item.size}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className='mt-4 space-y-1'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-500 line-through'>
                          {formatPrice(parseFloat(item.price) * 1.2)}{' '}
                          {/* Simulated original price */}
                        </span>
                        <span className='font-medium text-red-600'>
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <p className='text-sm text-gray-500 mt-2 italic'>
                      Returnerad artikel
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Order Summary */}
        <div className='mt-12 pt-8 border-t border-gray-200'>
          <div className='max-w-md ml-auto bg-gray-50 p-6 rounded-lg'>
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
              <div className='border-t border-gray-300 pt-3'>
                <div className='flex justify-between text-lg font-bold'>
                  <span className='text-gray-900'>SUMMA</span>
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
