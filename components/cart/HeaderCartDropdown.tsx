'use client';

import {useRef, useEffect} from 'react';
import {useCart} from '@/context/CartProvider';
import {AnimatePresence, motion} from 'framer-motion';
import CartItems from './CartItems';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';
import SpinningLogo from '../shared/ui/SpinningLogo';
import {PiBagSimpleThin} from 'react-icons/pi';

import {MotionCloseX} from '../shared/AnimatedDropdown';

export default function CartDropdown({
  setIsSearchExpanded,
  isSearchExpanded,
}: {
  setIsSearchExpanded: (value: boolean) => void;
  isSearchExpanded: boolean;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);

  const {
    cartItems,
    loading: isLoading,
    totalPrice,
    isCartOpen,
    openCart,
    closeCart,
    itemCount,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      dropdownRef.current?.focus();

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeCart();
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (!isCartOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartButtonRef.current &&
        cartButtonRef.current.contains(event.target as Node)
      ) {
        return;
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeCart();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen]);

  return (
    <div className='relative '>
      <button
        ref={cartButtonRef}
        className='relative flex cursor-pointer items-center outline-gray-800  justify-center group'
        onClick={() => {
          if (isSearchExpanded) {
            setIsSearchExpanded(false);
          }
          isCartOpen ? closeCart() : openCart();
        }}
        aria-label={`Visa varukorg ${itemCount > 0 ? ` (${itemCount} varor)` : ''}`}
      >
        <PiBagSimpleThin
          size={25}
          strokeWidth={0.8}
          className='cursor-pointer lg:hidden'
          aria-hidden='true'
        />
        <span className='hidden lg:block text-sm font-medium uppercase border-b border-transparent hover:border-black transition text-nowrap'>
          Varukorg {''}({itemCount})
        </span>

        {/* Mobile badge */}
        {itemCount > 0 && (
          <span
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pt-[2.5px] text-black text-[10px] font-medium lg:hidden'
            aria-hidden='true'
          >
            {itemCount}
          </span>
        )}
      </button>

      {/* Dropdown cart */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            ref={dropdownRef}
            tabIndex={-1}
            className={`absolute -right-1 lg:right-0 top-10 lg:top-9.5 w-72 sm:w-96 bg-white shadow-lg rounded-xs z-20 outline-none border border-gray-300  

            before:content-[''] before:absolute before:bottom-full before:right-2 lg:before:right-12  before:w-0 before:h-0  before:border-[8px] before:border-transparent before:border-b-gray-400/70

            after:content-[''] after:absolute after:bottom-full after:right-2 lg:after:right-12 after:w-0 after:h-0  after:border-[8px] after:border-transparent after:border-b-white after:-mb-px
            `}
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.1}}
          >
            <div className='flex justify-between items-center p-3 border-b border-gray-100'>
              <h2 className='font-medium text-sm lg:text-base'>
                Din varukorg ({itemCount})
              </h2>
              <div aria-label='Stäng varukorg' className='absolute right-1'>
                <MotionCloseX
                  className='px-3.5 py-1'
                  size={12}
                  strokeWidth={2}
                  onClick={closeCart}
                />
              </div>
            </div>

            {isLoading && (
              <div className='flex justify-center items-center p-8 z-50 bg-white'>
                <SpinningLogo />
              </div>
            )}

            {!isLoading && cartItems.length === 0 && (
              <EmptyCart compact onCartClick={closeCart} />
            )}

            {!isLoading && cartItems.length > 0 && (
              <>
                <CartItems compact />
                <CartSummary
                  totalPrice={totalPrice}
                  compact
                  onCartClick={closeCart}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
