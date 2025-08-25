'use client';

import {useState, useEffect, useRef} from 'react';
import {useCart} from '@/context/CartProvider';
import {AnimatePresence} from 'framer-motion';
import CartItems from './CartItems';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';
import StickyMobileSummary from './StickyMobileSummary';
import SpinningLogo from '@/components/shared/ui/SpinningLogo';

export default function CartPage() {
  const {cartItems, loading: isLoading, totalPrice, itemCount} = useCart();

  // Controls whether the fixed summary at bottom of screen is shown
  const [showFixedSummary, setShowFixedSummary] = useState(true);

  // Reference to the normal summary element so we can detect when it's visible
  const normalSummaryRef = useRef<HTMLDivElement>(null);

  // Handle scroll detection to show/hide the fixed summary
  useEffect(() => {
    const handleScroll = () => {
      if (!normalSummaryRef.current) return;
      const rect = normalSummaryRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      setShowFixedSummary(rect.top >= windowHeight - 100);
    };

    const throttledScrollHandler = (() => {
      let waiting = false;
      return () => {
        if (!waiting) {
          waiting = true;
          setTimeout(() => {
            handleScroll();
            waiting = false;
          }, 100);
        }
      };
    })();

    window.addEventListener('scroll', throttledScrollHandler);
    handleScroll();
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, []);

  return (
    <div className='w-full h-full  mx-auto z-1'>
      {/* Loading state */}
      {isLoading && (
        <div className='flex flex-col  justify-center items-center min-h-[calc(100vh-310px)]'>
          <SpinningLogo height='40' className='pb-4 opacity-50' />
          <p className='text-xs pl-1 font-semibold uppercase font-syne text-gray-400 '>
            Laddar...
          </p>
        </div>
      )}

      {/* Empty cart state */}
      {!isLoading && cartItems.length === 0 && <EmptyCart />}

      {/* Cart with items */}
      {cartItems.length > 0 && (
        <div className='space-y-6  py-2'>
          <h1 className='text-sm sm:text-base uppercase  mb-5 px-4 sm:px-8'>
            Din varukorg ({itemCount})
          </h1>

          <div className='flex flex-col lg:flex-row gap-6 lg:gap-10'>
            {/* Cart items section - Left side */}
            <div className='w-full'>
              <CartItems />
            </div>

            {/* Desktop Order summary section, always visible */}
            <div
              ref={normalSummaryRef}
              className='w-full lg:min-w-[350px] lg:max-w-[350px] xl:min-w-[410px] xl:max-w-[410px]  lg:sticky lg:top-30 lg:self-start px-5 lg:px-0 lg:pl-3 border-t border-gray-100 sm:border-none  bg-white mt-4  pt-5 sm:pt-0 lg:mt-0 transition-all duration-300'
            >
              <h2 className='text-lg   mb-5'>Ordersammanställning</h2>
              <CartSummary totalPrice={totalPrice} />
            </div>
          </div>

          {/* Mobile Fixed Summary, only visible when scrolling down */}
          <AnimatePresence>
            {cartItems.length > 0 && (
              <StickyMobileSummary
                totalPrice={totalPrice}
                visible={showFixedSummary}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
