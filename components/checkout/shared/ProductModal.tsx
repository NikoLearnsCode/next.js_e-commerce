'use client';

import {useCart} from '@/context/CartProvider';
import {useEffect} from 'react';
import Link from 'next/link';
import {
  MotionOverlay,
  MotionDropdown,
  MotionCloseX,
} from '@/components/shared/AnimatedSidebar';
import Image from 'next/image';
import {formatPrice} from '@/utils/format';
import {AnimatePresence} from 'framer-motion';

interface ProductModalProps {
  closeMenu: () => void;
  isOpen: boolean;
}

export default function ProductModal({closeMenu, isOpen}: ProductModalProps) {
  const {cartItems, itemCount, removeItem, removingItems} = useCart();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, closeMenu]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionOverlay key='product-modal-overlay' onClick={closeMenu} />
          <MotionDropdown
            position='right'
            key='product-modal'
            isMobile={true}
            className='overflow-y-auto min-w-full md:min-w-[450px]'
          >
            <div className='flex justify-between items-center'>
              <h2 className='font-medium text-base px-5 pt-4 pb-3'>
                DIN VARUKORG ({itemCount})
              </h2>
              <MotionCloseX
                onClick={closeMenu}
                size={14}
                strokeWidth={1.5}
                className='p-5 px-6 cursor-pointer'
              />
            </div>
            <div className='pt-3 grid grid-cols-1 max-h-[94%] overflow-y-auto'>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex relative  sm:px-4 py-1 justify-between gap-4 ${
                    removingItems[item.id] ? 'opacity-50' : ''
                  }`}
                >
                  <Link
                    href={`/${item.slug}`}
                    tabIndex={-1}
                    className='relative aspect-[7/9] min-w-2/3  w-full h-full'
                  >
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      priority
                      loading='eager'
                      className='object-cover'
                    />
                  </Link>
                  <div className='text-xs space-y-1 pt-2 px-1 min-w-1/3'>
                    <Link
                      href={`/${item.slug}`}
                      className='font-medium outline-none focus:underline focus:underline-offset-2'
                    >
                      {item.name}
                    </Link>

                    <p className=' text-gray-600'>Storlek: {item.size}</p>
                    <p className=' text-gray-600'>Färg: {item.color}</p>
                    <p className=' text-gray-600'>
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                    {cartItems.length > 2 && (
                      <button
                        className={`font-medium mr-3 mt-3 transition border-gray-400 text-black hover:text-red-700 hover:border-red-700 text-xs border-b disabled:opacity-50 cursor-pointer ${
                          removingItems[item.id]
                            ? 'text-red-700 border-red-700 hover:border-red-700'
                            : ''
                        }`}
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingItems[item.id]}
                      >
                        {removingItems[item.id] ? 'Tar bort' : 'Ta bort'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </MotionDropdown>
        </>
      )}
    </AnimatePresence>
  );
}
