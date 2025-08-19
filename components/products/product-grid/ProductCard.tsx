'use client';

import {useState, useEffect} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Product} from '@/lib/validators';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {twMerge} from 'tailwind-merge';
import 'swiper/css';
import 'swiper/css/navigation';
import {useNavigatedHistory} from '@/context/NavigatedHistoryProvider';

type ProductCardProps = {
  product: Product;
  priorityLoading?: boolean;
  interactionMode?: 'grid' | 'carouselItem';
  className?: string;
};

export default function ProductCard({
  product,
  priorityLoading = false,
  interactionMode = 'grid',
}: ProductCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  const {handleSaveNavigated} = useNavigatedHistory();
  const hasMultipleImages = product.images && product.images.length > 1;
  const prevButtonClass = `product-card-prev-${product.id}`;
  const nextButtonClass = `product-card-next-${product.id}`;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!product.images || product.images.length === 0) {
    return (
      <div className='border border-gray-50 h-full group'>
        <div className='w-full aspect-[7/9] bg-gray-200 flex items-center justify-center'>
          <span className='text-gray-500'>Ingen bild tillgänglig</span>
        </div>
        <div className='p-1.5 overflow-hidden'>
          <h2 className='truncate font-medium'>{product.name}</h2>
          <p className='mt-2 font-semibold'>{product.price.toFixed(2)} kr</p>
        </div>
      </div>
    );
  }

  if (interactionMode === 'carouselItem') {
    return (
      <div className='flex flex-col relative w-full h-full pb-6 group'>
        <div className='w-full relative h-full bg-white '>
          <Link
            href={`/${product.slug}`}
            className='block relative aspect-[7/9] h-full w-full '
            tabIndex={-1}
            onClick={() =>
              handleSaveNavigated({...product, image: product.images[0]})
            }
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              quality={90}
              priority={priorityLoading}
              loading={priorityLoading ? 'eager' : 'lazy'}
              className='object-cover h-full w-full'
              sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 50vw'
            />
          </Link>
        </div>
        <div className='p-1.5 flex flex-col  '>
          <Link
            href={`/${product.slug}`}
            className='outline-none focus:underline focus:underline-offset-2'
          >
            <h2 className=' text-xs sm:text-sm font-medium '>{product.name}</h2>
          </Link>
          <p className='text-xs sm:text-sm'>{product.price} kr</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex relative flex-col w-full h-full pb-6 group'>
      <div className='w-full relative h-full bg-white'>
        {hasMultipleImages ? (
          <>
            <Swiper
              key={isMobile ? 'mobile' : 'desktop'}
              modules={[Navigation]}
              slidesPerView={1}
              spaceBetween={1}
              loop={true}
              allowTouchMove={isMobile}
              preventClicks={false}
              preventClicksPropagation={false}
              navigation={
                !isMobile
                  ? {
                      prevEl: `.${prevButtonClass}`,
                      nextEl: `.${nextButtonClass}`,
                    }
                  : false
              }
              className='relative aspect-[7/9] h-full w-full'
            >
              {product.images.map((imgSrc, idx) => (
                <SwiperSlide key={idx}>
                  {/* ⬇⬇ ENDA ÄNDRINGEN: gör slidelänken icke-tabbbar */}
                  <Link
                    href={`/${product.slug}`}
                    className='relative block  h-full w-full'
                    tabIndex={-1}
                    aria-hidden='true'
                    onClick={() =>
                      handleSaveNavigated({
                        ...product,
                        image: product.images[0],
                      })
                    }
                  >
                    <Image
                      src={imgSrc}
                      alt={`${product.name} - bild ${idx + 1}`}
                      fill
                      quality={90}
                      priority={priorityLoading && idx === 0}
                      loading={priorityLoading && idx === 0 ? 'eager' : 'lazy'}
                      className='object-cover h-full w-full'
                      sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 50vw'
                    />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
            {!isMobile && (
              <>
                <button
                  className={twMerge(
                    `${prevButtonClass} absolute left-1 top-1/2 -translate-y-1/2 pr-4 pl-1 py-2 transition-opacity duration-800 z-10 opacity-0 group-hover:opacity-100  group-focus-within:opacity-100 outline-black `
                  )}
                  aria-label='Föregående bild'
                  type='button'
                >
                  <ChevronLeft
                    size={22}
                    strokeWidth={1.25}
                    className='text-gray-700 '
                  />
                </button>
                <button
                  className={twMerge(
                    `${nextButtonClass} absolute right-1 top-1/2 -translate-y-1/2 pl-4 pr-1 py-2 transition-opacity duration-800 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 outline-black`
                  )}
                  aria-label='Nästa bild'
                  type='button'
                >
                  <ChevronRight
                    size={22}
                    strokeWidth={1.25}
                    className='text-gray-700'
                  />
                </button>
              </>
            )}
          </>
        ) : (
          // Fallback om ovanstående failar
          <Link
            href={`/${product.slug}`}
            className='block relative aspect-[7/9] h-full w-full'
            onClick={() =>
              handleSaveNavigated({...product, image: product.images[0]})
            }
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priorityLoading}
              loading={priorityLoading ? 'eager' : 'lazy'}
              className='object-cover h-full w-full'
              sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 50vw'
            />
          </Link>
        )}
      </div>

      <div className='py-1.5 px-2 flex flex-col  '>
        <Link
          href={`/${product.slug}`}
          onClick={() =>
            handleSaveNavigated({...product, image: product.images[0]})
          }
          className='outline-none focus:underline focus:underline-offset-2'
        >
          <h2 className=' text-xs sm:text-sm font-medium'>{product.name}</h2>
        </Link>
        <p className=' text-xs sm:text-sm '>{product.price} kr</p>
      </div>
    </div>
  );
}
