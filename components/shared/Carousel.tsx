'use client';

import {ArrowLeft, ArrowRight} from 'lucide-react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import type SwiperType from 'swiper';
import {useState} from 'react';
import {twMerge} from 'tailwind-merge';

import 'swiper/css';
import 'swiper/css/navigation';

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
  id?: string;
  className?: string;
  spaceBetween?: number;
  slidesOffsetBefore?: number;
  breakpoints?: {
    [key: number]: {
      slidesPerView: number;
      spaceBetween?: number;
    };
  };
  showNavigation?: boolean;
  navigationClassName?: string;
  titleClassName?: string;
  titelDivClassName?: string;
}

const Carousel = <T,>({
  items,
  renderItem,
  title,
  id = 'carousel',
  className = '',
  spaceBetween = 3,
  slidesOffsetBefore = 0,
  breakpoints = {
    640: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 3,
    },
    1024: {
      slidesPerView: 4,
    },
    1280: {
      slidesPerView: 5,
    },
  },
  showNavigation = true,
  navigationClassName = '',
  titleClassName = '',
  titelDivClassName = '',
}: CarouselProps<T>) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const prevButtonClass = `${id}-prev`;
  const nextButtonClass = `${id}-next`;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={twMerge('w-full mx-auto', className)}>
      {/* Header with title and navigation */}
      {(title || showNavigation) && (
        <div className={twMerge('flex justify-between items-center mb-4', titelDivClassName)}>
          {title && (
            <h2
              className={twMerge(
                'text-base sm:text-lg text-gray-800 px-5 sm:px-4 font-medium',
                titleClassName
              )}
            >
              {title}
            </h2>
          )}

          {showNavigation && (
            <div className={twMerge('flex z-10', navigationClassName)}>
              <button
                className={`${prevButtonClass} py-1.5 pl-3 pr-1.5 transition cursor-pointer ${
                  isBeginning ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
                aria-label='Föregående'
                disabled={isBeginning}
              >
                <ArrowLeft
                  strokeWidth={1.25}
                  className='h-4 w-4 sm:h-4.5 sm:w-4.5'
                />
              </button>

              <button
                className={`${nextButtonClass} py-1.5 pr-3 pl-1.5 transition cursor-pointer ${
                  isEnd ? 'opacity-50 pointer-events-none' : 'opacity-100'
                }`}
                aria-label='Nästa'
                disabled={isEnd}
              >
                <ArrowRight
                  strokeWidth={1.25}
                  className='h-4 w-4 sm:h-4.5 sm:w-4.5'
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Swiper carousel */}
      <Swiper
        modules={[Navigation]}
        spaceBetween={spaceBetween}
        slidesPerView={2}
        slidesOffsetBefore={slidesOffsetBefore}
        breakpoints={breakpoints}
        navigation={{
          prevEl: `.${prevButtonClass}`,
          nextEl: `.${nextButtonClass}`,
        }}
        onSlideChange={handleSlideChange}
        onInit={handleSlideChange}
        className='w-full'
      >
        {items.map((item, index) => (
            <SwiperSlide className='w-full' key={index}>
            {renderItem(item, index)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
