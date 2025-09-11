// components/products/CarouselProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {Product} from '@/lib/types/db';

import FavoriteButton from '@/components/favorites/FavoriteButton';
import NewBadge from '@/components/shared/NewBadge';
import {formatPrice} from '@/utils/format';
import {useNavigatedHistory} from '@/context/NavigatedHistoryProvider';

type CarouselProductCardProps = {
  product: Product;
  priorityLoading?: boolean;
};

export default function CarouselProductCard({
  product,
  priorityLoading = false,
}: CarouselProductCardProps) {
  const {name, price, images, slug, isNew} = product;
  const hasImage = images && images.length > 0;
  const {handleSaveNavigated} = useNavigatedHistory();
  return (
    <div className='flex flex-col relative w-full h-full pb-6 group '>
      <div className='w-full relative bg-white aspect-[7/9]'>
        <Link
          href={`/${slug}`}
          className='block h-full w-full'
          tabIndex={-1}
          onClick={() => handleSaveNavigated({slug, image: images[0], name})}
        >
          {hasImage ? (
            <Image
              src={images[0]}
              alt={name}
              fill
              quality={90}
              priority={priorityLoading}
              className='object-cover'
              sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw'
            />
          ) : (
            <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
              <span className='text-gray-500'>Ingen bild</span>
            </div>
          )}
        </Link>
      </div>

      {isNew && (
        <div className='px-2.5 pt-0.5 flex items-center justify-between'>
          <NewBadge />
          <FavoriteButton product={product} />
        </div>
      )}

      <div className='px-2.5 pt-0.5 flex flex-col'>
        <div className='flex items-center justify-between'>
          <Link
            href={`/${slug}`}
            className='outline-none  focus:underline focus:underline-offset-2'
            onClick={() => handleSaveNavigated({slug, image: images[0], name})}
          >
            <h2 className='text-xs sm:text-sm font-medium'>{name}</h2>
          </Link>
          {!isNew && <FavoriteButton product={product} />}
        </div>
        <p className='text-xs text-gray-700 sm:text-sm'>{formatPrice(price)}</p>
      </div>
    </div>
  );
}
