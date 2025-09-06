'use client';

import {AnimatePresence} from 'framer-motion';
import {useFavorites} from '@/context/FavoritesProvider';
import ProductCard from '@/components/shared/cards/ProductCard';

export default function FavoritesItems() {
  const {favorites} = useFavorites();

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-0.5'>
      <AnimatePresence>
        {favorites.map((fav) => (
          <ProductCard key={fav.id} product={fav.product} layout='list' />
        ))}
      </AnimatePresence>
    </div>
  );
}
