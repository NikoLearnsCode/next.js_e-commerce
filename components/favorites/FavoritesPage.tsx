'use client';

import {useFavorites} from '@/context/FavoritesProvider';

import EmptyFavorites from './EmptyFavorites';
import SpinningLogo from '@/components/shared/ui/SpinningLogo';
import ProductCard from '../shared/cards/ProductCard';

export default function FavoritesPage() {
  const {loading: isLoading, favoriteCount, favorites} = useFavorites();

  return (
    <div className='w-full h-full mx-auto z-1'>
      {isLoading && (
        <div className='flex flex-col justify-center items-center min-h-[calc(100vh-310px)]'>
          <SpinningLogo height='40' className='pb-20 opacity-30' />
        </div>
      )}

      {!isLoading && favoriteCount === 0 && <EmptyFavorites />}

      {favoriteCount > 0 && (
        <div className='space-y-5 py-2'>
          <div className=' px-4 sm:px-6'>
            <h1 className='text-sm sm:text-base uppercase pl-0 lg:pl-2'>
              Dina favoriter ({favoriteCount})
            </h1>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-[1px]'>
            {favorites.map((fav) => (
              <ProductCard key={fav.id} product={fav.product} layout='list' />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
