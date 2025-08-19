'use client';

import {useState} from 'react';
import {Button} from '@/components/shared/button';
import {addToCart} from '@/actions/cart';
import {Product, CartItem} from '@/lib/validators';
import {v4 as uuidv4} from 'uuid';
import {useCart} from '@/context/CartProvider';

type AddToCartButtonProps = {
  product: Product;
  quantity?: number;
  className?: string;
  onAddSuccess?: () => void;
  disabled?: boolean;
  selectedSize: string | null;
};

export default function AddToCartButton({
  product,
  quantity = 1,
  className,
  selectedSize,
  onAddSuccess,
  disabled,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {updateCartItems, openCart} = useCart();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // Skapa ett CartItem objekt från produkten
      const cartItem: CartItem = {
        id: uuidv4(),
        product_id: product.id,
        quantity: quantity,
        price: product.price,
        name: product.name,
        brand: product.brand,
        description: product.description,
        slug: product.slug,
        category: product.category,
        size: selectedSize,
        color:
          product.color &&
          product.color.charAt(0).toUpperCase() + product.color?.slice(1),
        images: product.images.slice(0, 1),
        specs: product.specs,
      };

      const result = await addToCart(cartItem);

      if (result.success) {
        // Uppdatera varukorgsräknaren direkt
        if (result.cartItems && Array.isArray(result.cartItems)) {
          await updateCartItems(result.cartItems as CartItem[]);
        }

        // Anropa callback-funktionen om den finns
        if (onAddSuccess) {
          onAddSuccess();
        }
        openCart();
      } else {
        console.error('Fel vid tillägg i varukorg:', result.error);
      }
    } catch (error) {
      console.error('Fel vid tillägg i varukorg:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || disabled}
      className={className}
    >
      {disabled
        ? 'Välj storlek'
        : isLoading
          ? 'Lägger till...'
          : 'Lägg i varukorg'}
    </Button>
  );
}
