'use client'; // Mark as Client Component

import Image from 'next/image';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
import {Link} from '@/components/shared/link';
import {ArrowRight} from 'lucide-react';
// Assuming your Order type is defined and exported from here
// You might need to adjust the path and ensure OrderItem is also available if needed
// For now, using placeholder types, replace with your actual types
type OrderItem = any;
type Order = {
  id: string;
  created_at: Date | null;
  total_amount?: string;
  order_items: OrderItem[];
  // Add other fields as needed
};

interface OrdersClientContentProps {
  orders: Order[];
}

// Helper function to format currency (copied from previous page logic)
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

export default function OrdersClientContent({
  orders,
}: OrdersClientContentProps) {
  return (
    <AnimatedAuthContainer direction='right' className='max-w-4xl w-full '>
      <span className='px-4 flex justify-between items-center mb-8 max-w-md mx-auto'>
        <h1 className='text-xl uppercase font-syne font-medium '>
          Mina Ordrar
        </h1>
        <Link
          className='text-xs px-0 text-primary font-medium hover:underline flex  gap-2  group tracking-wider '
          href='/profile'
        >
          {' '}
          Tillbaka
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            className='group-hover:translate-x-1 transition-transform duration-300'
          />
        </Link>
      </span>

      {orders.length === 0 ? (
        <p className='mx-auto max-w-md px-4 text-base text-gray-600'>
          Du har inte lagt några ordrar än.
        </p>
      ) : (
        <div className='   grid grid-cols-1 md:grid-cols-2  gap-2 h-auto items-start'>
          {orders.map((order) => (
            <div key={order.id} className='border border-gray-100 p-4'>
              <div className=' p-4'>
                <div className='flex justify-between'>
                  <div className='flex flex-col mb-4 pb-4 text-gray-700'>
                    <p className='text-lg font-medium mt-2 md:mt-0'>
                      {''}
                      {formatPrice(order.total_amount)}{' '}
                      <span className='text-gray-600 '>
                        ({order.order_items.length})
                      </span>
                    </p>
                    <p className='text-sm text-gray-600'>
                      Ordernr: #{order.id?.substring(0, 8)}
                    </p>
                  </div>
                  <p className='text-base   underline underline-offset-4  font-normal text-gray-600'>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('sv-SE')
                      : '-'}
                  </p>
                </div>

                <div className='space-y-3'>
                  {(order.order_items || []).map(
                    (item: OrderItem, index: number) => (
                      <div
                        key={`${item.product_id}-${item.size || index}`}
                        className='flex items-center space-x-3 text-sm'
                      >
                        {item.image && (
                          <div className='w-15 h-20  rounded overflow-hidden flex-shrink-0'>
                            <Image
                              src={item.image}
                              alt={item.name || 'Produktbild'}
                              width={80}
                              height={80}
                              className='object-contain w-full h-full'
                            />
                          </div>
                        )}
                        <div className='flex-grow'>
                          <p className='font-medium'>
                            {item.name || 'Produktnamn saknas'}
                          </p>
                          <p className='text-gray-600'>
                            Antal: {item.quantity}
                          </p>
                          {item.size && (
                            <p className='text-gray-600'>
                              Storlek: {item.size}
                            </p>
                          )}
                        </div>
                        <p className='text-gray-700'>
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    )
                  )}
                  {(order.order_items || []).length === 0 && (
                    <p className='text-sm text-gray-600'>
                      Inga produkter hittades för denna order.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AnimatedAuthContainer>
  );
}
