'use client';

import Image from 'next/image';
import {ArrowRight} from 'lucide-react';

import type {OrderWithItems} from '@/lib/validators';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
import {Link} from '@/components/shared/link';
import Carousel from '@/components/shared/Carousel';

interface OrdersClientContentProps {
  orders: OrderWithItems[];
}

export default function OrdersClientContent({
  orders,
}: OrdersClientContentProps) {
  return (
    <AnimatedAuthContainer direction='left' className='max-w-4xl w-full'>
      {/* Header */}
      <div className=' flex justify-between items-center mb-8 px-8'>
        <h1 className='text-lg uppercase font-syne font-medium'>Mina Ordrar</h1>
        <Link
          className='text-xs text-primary font-medium hover:underline flex gap-2 group tracking-wider'
          href='/profile'
        >
          Tillbaka
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            className='group-hover:translate-x-1 transition-transform duration-300'
          />
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className='text-center text-gray-600 py-12'>
          Du har inte lagt några ordrar än.
        </p>
      ) : (
        <div className='space-y-12 px-4 h-full'>
          {/* Section Header */}

          {orders.map((order) => {
            const formattedDate = order.created_at
              ? new Date(order.created_at).toLocaleDateString('sv-SE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Okänt datum';

            return (
              <div key={order.id} className='w-full  h-full flex flex-col'>
                {/* Order Items Carousel with date as title */}
                <Carousel
                  items={order.order_items}
                  title={formattedDate}
                  titleClassName='text-sm font-normal text-gray-600'
                  renderItem={(item, _index) => (
                    <div className='aspect-[7/9]'>
                      <Link
                        href={`/profile/orders/${order.id}`}
                        className='relative block h-full w-full'
                      >
                        <div className='bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 h-full w-full'>
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name || 'Produktbild'}
                              fill
                              className='object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-400'>
                              <span className='text-xs'>Ingen bild</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  )}
                  showNavigation={true}
                  id={`order-${order.id}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </AnimatedAuthContainer>
  );
}
