'use client';

import Image from 'next/image';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
import {Link} from '@/components/shared/link';
import {ArrowRight, ArrowLeft} from 'lucide-react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import type SwiperType from 'swiper';
import {useState} from 'react';
import 'swiper/css';
import 'swiper/css/navigation';

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
  order_items: OrderItem[];
};

interface OrdersClientContentProps {
  orders: Order[];
}

export default function OrdersClientContent({
  orders,
}: OrdersClientContentProps) {
  const [carouselStates, setCarouselStates] = useState<{
    [key: string]: {isBeginning: boolean; isEnd: boolean};
  }>({});

  const handleSlideChange = (swiper: SwiperType, orderId: string) => {
    setCarouselStates((prev) => ({
      ...prev,
      [orderId]: {
        isBeginning: swiper.isBeginning,
        isEnd: swiper.isEnd,
      },
    }));
  };
  return (
    <AnimatedAuthContainer direction='up' className='max-w-6xl w-full'>
      {/* Header */}
      <div className='px-4 flex justify-between items-center mb-8'>
        <h1 className='text-xl uppercase font-syne font-medium'>Mina Ordrar</h1>
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
            const orderState = carouselStates[order.id] || {
              isBeginning: true,
              isEnd: false,
            };
            const prevButtonClass = `order-${order.id}-prev`;
            const nextButtonClass = `order-${order.id}-next`;

            return (
              <div key={order.id} className='w-full h-full flex flex-col'>
                {/* Date and Navigation */}
                <div className='flex justify-between mb-4'>
                  <p className='text-sm text-gray-600'>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('sv-SE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Okänt datum'}
                  </p>

                  <div className='flex z-10'>
                    <button
                      className={`${prevButtonClass} py-1.5 px-3 transition cursor-pointer ${
                        orderState.isBeginning
                          ? 'opacity-50 pointer-events-none'
                          : 'opacity-100'
                      }`}
                      aria-label='Föregående'
                      disabled={orderState.isBeginning}
                    >
                      <ArrowLeft
                        strokeWidth={1.25}
                        className='h-4 w-4 sm:h-4.5 sm:w-4.5'
                      />
                    </button>

                    <button
                      className={`${nextButtonClass} py-1.5 px-3 transition cursor-pointer ${
                        orderState.isEnd
                          ? 'opacity-50 pointer-events-none'
                          : 'opacity-100'
                      }`}
                      aria-label='Nästa'
                      disabled={orderState.isEnd}
                    >
                      <ArrowRight
                        strokeWidth={1.25}
                        className='h-4 w-4 sm:h-4.5 sm:w-4.5'
                      />
                    </button>
                  </div>
                </div>

                {/* Product Images Swiper */}
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={4}
                  slidesPerView={2}
                  slidesOffsetBefore={20}
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 4,
                    },
                    768: {
                      slidesPerView: 3,
                      spaceBetween: 4,
                    },
                    1024: {
                      slidesPerView: 4,
                      spaceBetween: 4,
                    },
                    1280: {
                      slidesPerView: 5,
                      spaceBetween: 4,
                    },
                  }}
                  navigation={{
                    prevEl: `.${prevButtonClass}`,
                    nextEl: `.${nextButtonClass}`,
                  }}
                  onSlideChange={(swiper) =>
                    handleSlideChange(swiper, order.id)
                  }
                  onInit={(swiper) => handleSlideChange(swiper, order.id)}
                  className='w-full'
                >
                  {order.order_items.map((item, index) => (
                    <SwiperSlide
                      className='aspect-[7/9]'
                      key={`${item.product_id}-${index}`}
                    >
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
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            );
          })}
        </div>
      )}
    </AnimatedAuthContainer>
  );
}
