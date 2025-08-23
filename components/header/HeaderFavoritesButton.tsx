'use client';

import Link from 'next/link';
import {useFavorites} from '@/context/FavoritesProvider';
import {Heart} from 'lucide-react';

export default function HeaderFavoritesButton({
  setIsSearchExpanded,
  isSearchExpanded,
}: {
  setIsSearchExpanded: (value: boolean) => void;
  isSearchExpanded: boolean;
}) {
  const {favoriteCount} = useFavorites();

  return (
    <Link
      href='/favorites'
      className='relative flex cursor-pointer items-center outline-gray-800 justify-center group'
      onClick={() => {
        if (isSearchExpanded) {
          setIsSearchExpanded(false);
        }
      }}
      aria-label={`Gå till favoriter ${favoriteCount > 0 ? ` (${favoriteCount} favoriter)` : ''}`}
    >
      {/* Mobile heart icon */}
      <Heart
        size={24}
        strokeWidth={1}
        className='cursor-pointer lg:hidden'
        aria-hidden='true'
      />

      {/* Desktop text */}
      <span className='hidden lg:block text-sm font-medium uppercase border-b border-transparent hover:border-black transition text-nowrap'>
        Favoriter ({favoriteCount})
      </span>

      {/* Mobile badge */}
      {favoriteCount > 0 && (
        <span
          className='absolute top-1/2 -translate-y-1/2 pb-1 text-[10px] font-medium rounded-full pt-[1px] flex items-center justify-center px-1 lg:hidden'
          aria-hidden='true'
        >
          {favoriteCount > 99 ? '99+' : favoriteCount}
        </span>
      )}
    </Link>
  );
}
