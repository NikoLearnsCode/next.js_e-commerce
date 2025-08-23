'use client';

import {AnimatePresence} from 'framer-motion';
import {useFavorites} from '@/context/FavoritesProvider';
import ProductListItem from '@/components/shared/ProductListItem';

export default function FavoritesItems() {
  const {favorites, removeFavorite, updatingItems} = useFavorites();

  // Handler for removing items from favorites
  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFavorite(productId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-0.5'>
      <AnimatePresence>
        {favorites.map((fav) => {
          const isUpdating = updatingItems[fav.product_id] || false;

          return (
            <ProductListItem
              key={fav.id}
              item={fav}
              type='favorite'
              isUpdating={isUpdating}
              onRemove={handleRemoveItem}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
