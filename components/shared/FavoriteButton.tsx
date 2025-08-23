'use client';

import {Heart} from 'lucide-react';
import {useFavorites} from '@/context/FavoritesProvider';
import {Product} from '@/lib/validators';

type FavoriteButtonProps = {
  product: Product;
  size?: number;
  className?: string;
  variant?: 'minimal' | 'styled' | 'overlay';
};

export default function FavoriteButton({
  product,
  size = 18,
  className = '',
  variant = 'minimal',
}: FavoriteButtonProps) {
  const {isFavorite, toggleFavoriteItem, updatingItems} = useFavorites();
  const productIsFavorite = isFavorite(product.id);
  const isUpdating = updatingItems[product.id] || false;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavoriteItem(product);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const baseClasses = 'cursor-pointer p-0.5 pl-3  transition-all duration-200 disabled:opacity-50';

  const variantClasses = {
    minimal: baseClasses,
    styled: `${baseClasses} w-[48px] h-13 border border-gray-200 bg-gray-50 hover:border-black hover:bg-gray-100 flex items-center justify-center`,
    overlay: `${baseClasses} absolute top-2 right-2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm`,
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isUpdating}
      className={`${variantClasses[variant]} ${className}`}
      aria-label={
        productIsFavorite
          ? `Ta bort ${product.name} från favoriter`
          : `Lägg till ${product.name} i favoriter`
      }
    >
      <Heart
        size={size}
        strokeWidth={1.5}
        className={`transition-all duration-200 ${
          productIsFavorite
            ? 'fill-black text-black'
            : variant === 'styled'
              ? 'text-gray-700 hover:text-black'
              : variant === 'overlay'
                ? 'text-gray-800 hover:text-black'
                : 'text-gray-600 hover:text-black'
        }`}
      />
    </button>
  );
}
