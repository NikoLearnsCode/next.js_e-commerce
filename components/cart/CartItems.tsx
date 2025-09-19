'use client';

import Image from 'next/image';
import Link from 'next/link';
import {AnimatePresence} from 'framer-motion';
import {formatPrice} from '@/utils/formatPrice';
import {useCart} from '@/context/CartProvider';
import CartCard from '@/components/shared/cards/CartCard';
type CartItemsProps = {
  compact?: boolean;
};

export default function CartItems({compact = false}: CartItemsProps) {
  const {
    cartItems,
    removeItem,
    updateItemQuantity,
    updatingItems,
    removingItems,
  } = useCart();

  // Handler for removing items from cart
  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Handler for updating item quantities
  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      await updateItemQuantity(itemId, quantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <div
      className={
        compact
          ? 'max-h-[25vh] sm:max-h-[40vh] overflow-y-auto'
          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-0.5'
      }
    >
      <AnimatePresence>
        {cartItems.map((item) => {
          const isUpdating = updatingItems[item.id] || false;
          const isRemoving = removingItems[item.id] || false;

          // Compact view for header dropdown
          if (compact) {
            return (
              <div
                key={item.id}
                className={`flex items-center  px-5 not-last:border-b  border-gray-100 py-3 justify-between gap-4 ${removingItems[item.id] ? 'opacity-50' : ''}`}
              >
                <div className='relative h-auto w-14 md:w-16 bg-gray-100 mr-3'>
                  <Link href={`/${item.slug}`}>
                    {item.images[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        height={150}
                        width={100}
                        className='object-contain'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-gray-400 text-xs'>
                        Ingen bild
                      </div>
                    )}
                  </Link>
                </div>

                <div className='flex-1 min-w-0 text-[11px] md:text-xs'>
                  <h3 className=' font-medium truncate'>{item.name}</h3>

                  <p>Storlek: {item.size}</p>
                  <p>
                    Färg: <span></span>
                    {item.color}
                  </p>
                  <div className='flex justify-between items-center'>
                    <span>
                      {item.quantity} x {formatPrice(item.price)}
                    </span>

                    <button
                      className={`font-medium mr-3 transition border-gray-400 text-black hover:text-red-700 hover:border-red-700  text-[11px] md:text-xs border-b disabled:opacity-50 cursor-pointer ${removingItems[item.id] ? 'text-red-700 border-red-700 hover:border-red-700' : ''}`}
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removingItems[item.id]}
                    >
                      {removingItems[item.id] ? 'Tar bort' : 'Ta bort'}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // Full view for cart page
          return (
            <CartCard
              key={item.id}
              item={item}
              isUpdating={isUpdating}
              isRemoving={isRemoving}
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
