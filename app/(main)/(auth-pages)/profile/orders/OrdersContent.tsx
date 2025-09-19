'use client';

import Image from 'next/image';
import {ArrowRight} from 'lucide-react';
import type {OrderOverview} from '@/lib/types/db-types';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
import {Link} from '@/components/shared/ui/link';
import Carousel from '@/components/shared/Carousel';
import {useMediaQuery} from '@/hooks/useMediaQuery';

interface OrdersClientContentProps {
  orders: OrderOverview[];
}

export default function OrdersClientContent({
  orders,
}: OrdersClientContentProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <AnimatedAuthContainer
      direction='left'
      className={`${orders.length === 0 ? 'max-w-lg' : 'max-w-5xl'} w-full`}
    >
      {/* Header */}
      <div className=' flex justify-between items-center mb-8 pl-4 pr-2 lg:px-0'>
        <h1 className=' text-base md:text-lg uppercase font-medium'>
          Mina beställningar
        </h1>
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
        <p className='text-center  text-gray-600 py-12'>
          Du har inte lagt några ordrar än.
        </p>
      ) : (
        <div className='space-y-12  h-full'>
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
                  titelDivClassName='pr-2 lg:pr-0'
                  titleClassName='text-sm  text-gray-600 px-4 lg:px-0 sm:text-base'
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
                  breakpoints={{
                    640: {slidesPerView: 2, spaceBetween: 3},
                    768: {slidesPerView: 3, spaceBetween: 3},
                  }}
                  showNavigation={
                    isDesktop
                      ? order.order_items.length > 3
                      : order.order_items.length > 2
                  }
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
