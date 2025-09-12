// components/products/ProductCard.tsx
'use client';

import {useState, useEffect} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Product} from '@/lib/types/db';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {twMerge} from 'tailwind-merge';
import 'swiper/css';
import 'swiper/css/navigation';
import {usePathname} from 'next/navigation';

import FavoriteButton from '@/components/favorites/FavoriteButton';
import NewBadge from '@/components/shared/NewBadge';
import {formatPrice} from '@/utils/format';
import {useFavorites} from '@/context/FavoritesProvider';
import SpinningLogo from '@/components/shared/ui/SpinningLogo';
import {useNavigatedHistory} from '@/context/NavigatedHistoryProvider';

type ProductCardProps = {
  product: Product;
  priorityLoading?: boolean;
  className?: string;
  layout?: 'grid' | 'list';
};

export default function ProductCard({
  product,
  priorityLoading = false,
  layout = 'grid',
}: ProductCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const {name, price, images, slug, isNew, id, brand, color} = product;
  const {removeFavorite, updatingItems} = useFavorites();
  const {handleSaveNavigated} = useNavigatedHistory();

  const pathname = usePathname();
  // Handler for removing items from favorites (only used in list layout)
  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFavorite(productId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const hasMultipleImages = images && images.length > 1;
  const hasImages = images && images.length > 0;

  // Navigation för Swiper
  const prevButtonClass = `product-card-prev-${id}`;
  const nextButtonClass = `product-card-next-${id}`;
  const showNavigationButtons = !isMobile && hasMultipleImages;
  const enableTouchNavigation = isMobile && hasMultipleImages;

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Placeholder om inga bilder finns
  if (!hasImages) {
    return (
      <div className='border border-gray-50 h-full group'>
        <div className='w-full aspect-[7/9] bg-gray-200 flex items-center justify-center'>
          <span className='text-gray-500'>Ingen bild tillgänglig</span>
        </div>
        <div className='p-1.5 overflow-hidden'>
          <h2 className='truncate'>{name}</h2>
          <p className='mt-2'>{formatPrice(price)}</p>
        </div>
      </div>
    );
  }

  // Conditional styling based on layout
  const isListLayout = layout === 'list';
  const isUpdating = updatingItems[id] || false;

  return (
    <div
      className={
        isListLayout
          ? 'flex flex-row sm:flex-col pb-1 md:pb-0 overflow-hidden group'
          : 'flex relative flex-col w-full h-full pb-6 group'
      }
    >
      <div
        className={
          isListLayout
            ? 'relative min-w-2/3 w-full h-full aspect-[7/9]'
            : 'w-full relative bg-white aspect-[7/9]'
        }
      >
        {hasMultipleImages ? (
          <>
            <Swiper
              key={isMobile ? 'mobile' : 'desktop'}
              modules={[Navigation]}
              slidesPerView={1}
              preventClicks={false}
              preventClicksPropagation={false}
              loop={true}
              allowTouchMove={enableTouchNavigation}
              navigation={
                showNavigationButtons
                  ? {
                      prevEl: `.${prevButtonClass}`,
                      nextEl: `.${nextButtonClass}`,
                    }
                  : false
              }
              className='h-full w-full'
            >
              {images.map((imgSrc, idx) => (
                <SwiperSlide key={idx}>
                  <Link
                    href={`/${slug}`}
                    className='block h-full w-full'
                    tabIndex={-1}
                    onClick={() =>
                      handleSaveNavigated({slug, image: imgSrc, name})
                    }
                  >
                    <Image
                      src={imgSrc}
                      alt={`${name} - bild ${idx + 1}`}
                      fill
                      quality={90}
                      priority={priorityLoading && idx === 0}
                      className='object-cover p-[1px]'
                      sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw'
                    />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
            {showNavigationButtons && (
              <>
                <button
                  className={twMerge(
                    `${prevButtonClass} absolute left-1 top-1/2 -translate-y-1/2 pr-4 pl-1 py-2 transition-opacity duration-800 z-10 opacity-0 group-hover:opacity-100  group-focus-within:opacity-100 outline-black `
                  )}
                  aria-label='Föregående bild'
                  type='button'
                >
                  <ChevronLeft
                    size={20}
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
                    size={20}
                    strokeWidth={1.25}
                    className='text-gray-700'
                  />
                </button>
              </>
            )}
          </>
        ) : (
          <Link href={`/${slug}`} className='block h-full w-full'>
            <Image
              src={images[0]}
              alt={name}
              fill
              priority={priorityLoading}
              className='object-cover'
              sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw'
            />
          </Link>
        )}

        {/* Remove button for list layout */}
        {isListLayout && (
          <button
            className='absolute bg-white/60 top-2 right-2 z-1 hover:text-red-900 p-2 cursor-pointer'
            onClick={() => handleRemoveItem(id)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <SpinningLogo width='24' height='17' />
            ) : (
              <X size={16} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>

      {/* Info-sektion */}
      {isListLayout ? (
        <div className='px-3 py-2 relative min-w-1/3 lg:pb-10 lg:px-3 flex flex-col mb-2'>
          <div className='flex flex-col flex-1 gap-1 sm:gap-0 justify-center items-center sm:items-start text-sm'>
            <Link
              href={`/${slug}`}
              className='outline-none focus:underline focus:underline-offset-2 text-wrap text-break text-center sm:text-start '
              onClick={() =>
                handleSaveNavigated({slug, image: images[0], name})
              }
            >
              {isNew && !pathname.endsWith('/nyheter') && <NewBadge />}
              {name}
            </Link>

            <span className='text-black/80 text-sm'>{formatPrice(price)}</span>
          </div>
          <div className='text-sm mt-1 gap-2 md:text-base flex flex-col sm:flex-row items-center'>
            <div className='flex gap-4 text-[13px]'>
              {brand && <span>{brand}</span>}
              {color && <span>{color}</span>}
            </div>
          </div>
        </div>
      ) : (
        <>
          {isNew && !pathname.endsWith('/nyheter') && (
            <div className='px-2 pt-0.5 flex items-center justify-between'>
              <NewBadge />
              <FavoriteButton product={product} />
            </div>
          )}

          <div className='px-2 pt-0.5 flex flex-col'>
            <div className='flex items-center justify-between'>
              <Link
                href={`/${slug}`}
                className='outline-none focus:underline focus:underline-offset-2'
                onClick={() =>
                  handleSaveNavigated({slug, image: images[0], name})
                }
              >
                <h2 className='text-xs sm:text-sm font-medium'>{name}</h2>
              </Link>
              {(!isNew || pathname.endsWith('/nyheter')) && (
                <FavoriteButton product={product} />
              )}
            </div>
            <p className='text-xs text-gray-700 sm:text-sm'>
              {formatPrice(price)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
