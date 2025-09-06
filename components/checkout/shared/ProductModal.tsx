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
            <div className='absolute top-1.5 right-3'>
              <MotionCloseX
                onClick={closeMenu}
                size={14}
                strokeWidth={1.5}
                className='p-5 cursor-pointer'
              />
            </div>
            <h2 className='font-medium text-base p-5'>
              DIN VARUKORG ({itemCount})
            </h2>

            <div className='pt-3 pb-12 grid grid-cols-1 max-h-[88%] overflow-y-auto'>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center px-5 not-last:border-b border-gray-100 py-3 justify-between gap-4 ${
                    removingItems[item.id] ? 'opacity-50' : ''
                  }`}
                >
                  <Link
                    href={`/${item.slug}`}
                    tabIndex={-1}
                    className='relative bg-gray-50'
                  >
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      height={160}
                      width={140}
                      priority
                      loading='eager'
                      className='object-cover'
                    />
                  </Link>
                  <div className='flex-1'>
                    <Link
                      href={`/${item.slug}`}
                      className='font-medium outline-none focus:underline focus:underline-offset-2'
                    >
                      {item.name}
                    </Link>

                    <p className='text-sm text-gray-600'>
                      Storlek: {item.size}
                    </p>
                    <p className='text-sm text-gray-600'>Färg: {item.color}</p>
                    <p className='text-sm text-gray-600'>
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                    {cartItems.length > 1 && (
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
