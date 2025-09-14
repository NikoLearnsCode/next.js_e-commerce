import {useFavorites} from '@/context/FavoritesProvider';
import {FavoriteButtonProduct} from '@/lib/types/db';
import {Heart} from 'lucide-react';
import {twMerge} from 'tailwind-merge';

type FavoriteButtonProps = {
  product: FavoriteButtonProduct;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: 'default' | 'inverted';
};

// Ny 'overlay' variant för hjärtat på bilden
export default function FavoriteButton({
  size = 16,
  strokeWidth = 1.5,
  className = '',
  product,
  variant = 'default',
}: FavoriteButtonProps) {
  const {toggleFavoriteItem, isFavorite, updatingItems} = useFavorites();
  const productIsFavorite = isFavorite(product.id);
  const isUpdating = updatingItems[product.id] || false;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavoriteItem(product.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const heartClassName =
    variant === 'default'
      ? productIsFavorite
        ? 'fill-black text-black'
        : 'fill-white text-black'
      : productIsFavorite
        ? 'fill-white text-white'
        : 'fill-black text-white';

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isUpdating}
      data-variant={variant}
      className={twMerge(
        'cursor-pointer  pl-3 inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50',
        className
      )}
    >
      <Heart
        size={size}
        strokeWidth={strokeWidth}
        className={`transition-all  ${heartClassName}`}
      />
    </button>
  );
}
