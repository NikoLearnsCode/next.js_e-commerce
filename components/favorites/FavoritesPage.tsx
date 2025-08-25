'use client';

import {useFavorites} from '@/context/FavoritesProvider';
import FavoritesItems from './FavoritesItems';
import EmptyFavorites from './EmptyFavorites';
import SpinningLogo from '@/components/shared/ui/SpinningLogo';

export default function FavoritesPage() {
  const {favorites, loading: isLoading, favoriteCount} = useFavorites();

  return (
    <div className='w-full h-full mx-auto z-1'>
      {/* Loading state */}
      {isLoading && (
        <div className='flex flex-col justify-center items-center min-h-[calc(100vh-310px)]'>
          <SpinningLogo height='40' className='pb-4 opacity-50' />
          <p className='text-xs pl-1 font-semibold uppercase font-syne text-gray-400'>
            Laddar...
          </p>
        </div>
      )}

      {/* Empty favorites state */}
      {!isLoading && favorites.length === 0 && <EmptyFavorites />}

      {/* Favorites with items */}
      {favorites.length > 0 && (
        <div className='space-y-5 py-2'>
          <div className=' px-4 sm:px-6'>
            <h1 className='text-sm sm:text-base uppercase '>
              Dina favoriter ({favoriteCount})
            </h1>
          </div>

          <div className=''>
            <FavoritesItems />
          </div>
        </div>
      )}
    </div>
  );
}
