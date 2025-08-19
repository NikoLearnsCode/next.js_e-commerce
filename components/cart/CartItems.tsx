'use client';

import Image from 'next/image';
import Link from 'next/link';

import {Minus, Plus, X} from 'lucide-react';
import {formatPrice} from '@/lib/helpers';
import {motion, AnimatePresence} from 'framer-motion';
import {useCart} from '@/context/CartProvider';
import SpinningLogo from '@/components/shared/SpinningLogo';
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
          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 '
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
            <motion.div
              key={item.id}
              className='flex flex-row sm:flex-col pb-4 mb-4 sm:mb-0  border-b border-gray-50 sm:border-none overflow-hidden sm:p-0.5'
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
                transition: {
                  opacity: {duration: 0.2},
                  height: {duration: 0.3},
                },
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
              layout
            >
              {/* Image section */}
              <div className='relative min-w-2/3 w-full h-full aspect-7/9'>
                <Link tabIndex={-1} href={`/${item.slug}`}>
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      quality={90}
                     
                      priority
                      className='object-cover  w-full h-full '
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-gray-400'>
                      Ingen bild
                    </div>
                  )}
                </Link>
                <button
                  className='absolute top-0 right-0 z-1 hover:text-red-800 p-3 cursor-pointer '
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <SpinningLogo width='24' height='17' />
                  ) : (
                    <X size={16} strokeWidth={1.5} />
                  )}
                </button>
              </div>

              <div className='px-3 py-2 relative min-w-1/3 lg:pb-10 lg:px-2.5  flex flex-col  mb-2'>
                <div className='flex flex-col flex-1 gap-1 sm:gap-0 justify-center items-center sm:items-start text-sm md:text-base'>
                  <Link
                    href={`/${item.slug}`}
                    className=' outline-none focus:underline focus:underline-offset-2 text-wrap text-break text-center '
                  >
                    {item.name}
                  </Link>
                  <span className='text-black/80 '>
                    {formatPrice(item.price)}
                  </span>
                </div>

                <div className='text-sm mt-1 gap-2 md:text-base flex flex-col sm:flex-row items-center '>
                  <div className='flex items-center gap-2 justify-center'>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={isUpdating || item.quantity <= 1}
                      className={`h-8 w-8  flex items-center justify-center  ${
                        item.quantity <= 1
                          ? 'pointer-events-none opacity-30 '
                          : 'cursor-pointer '
                      }`}
                    >
                      <Minus
                        strokeWidth={1.25}
                        className={` w-4.5 h-4.5   ${isUpdating ? 'cursor-not-allowed' : ''}`}
                      />
                    </button>

                    <span className='text-sm'>{item.quantity}</span>

                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={isUpdating}
                      className='h-8 w-8 flex items-center justify-center  cursor-pointer'
                    >
                      <Plus
                        strokeWidth={1.25}
                        className={` w-4.5 h-4.5   ${isUpdating ? 'cursor-not-allowed' : ''}`}
                      />
                    </button>
                  </div>
                  <div className='pl-2 flex gap-4 text-sm'>
                    <span>{item.size}</span>
                    <span>{item.color}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
