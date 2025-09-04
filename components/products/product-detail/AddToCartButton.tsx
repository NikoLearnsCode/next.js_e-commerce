'use client';

import {useState} from 'react';
import {Button} from '@/components/shared/ui/button';
import {Product} from '@/lib/types/db';
import {NewCartItem} from '@/lib/validators';
import {useCart} from '@/context/CartProvider';

type AddToCartButtonProps = {
  product: Product;
  quantity: number;
  className?: string;
  onAddSuccess?: () => void;
  onSizeMissing?: () => void;
  selectedSize: string;
};

export default function AddToCartButton({
  product,
  quantity = 1,
  className,
  selectedSize,
  onAddSuccess,
  onSizeMissing,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {addItem, openCart} = useCart();

  const handleAddToCart = async () => {
    if (!selectedSize) {
      onSizeMissing?.();
      return;
    }

    setIsLoading(true);
    try {
      const itemToAdd: NewCartItem = {
        product_id: product.id,
        quantity: quantity,
        size: selectedSize,
      };

      await addItem(itemToAdd);

      onAddSuccess?.();
      openCart();
    } catch (error) {
      console.error('Fel vid tillägg i varukorg:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Lägger till...' : 'Lägg till i varukorg'}
    </Button>
  );
}
