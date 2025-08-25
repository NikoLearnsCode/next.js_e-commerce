'use client';

import {useState} from 'react';
import {Button} from '@/components/shared/ui/button';
import {Product, CartItem} from '@/lib/validators';
import {v4 as uuidv4} from 'uuid';
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
      const cartItem: CartItem = {
        id: uuidv4(),
        product_id: product.id,
        quantity: quantity,
        price: product.price,
        color: product.color.charAt(0).toUpperCase() + product.color.slice(1),
        brand: product.brand,
        name: product.name,
        slug: product.slug,
        size: selectedSize,
        images: product.images.slice(0, 1),
      };

      await addItem(cartItem);

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
