'use client';

import {useFavorites} from '@/context/FavoritesProvider';
import FavoritesItems from './FavoritesGrid';
import EmptyFavorites from './EmptyFavorites';
import SpinningLogo from '@/components/shared/ui/SpinningLogo';

export default function FavoritesPage() {
  const { loading: isLoading, favoriteCount} = useFavorites();

  return (
    <div className='w-full h-full mx-auto z-1'>
      {/* Loading state */}
      {isLoading && (
        <div className='flex flex-col justify-center items-center min-h-[calc(100vh-310px)]'>
          <SpinningLogo height='40' className='pb-20 opacity-30' />
        </div>
      )}

      {/* Empty favorites state */}
      {!isLoading && favoriteCount === 0 && <EmptyFavorites />}

      {/* Favorites with items */}
      {favoriteCount > 0 && (
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
