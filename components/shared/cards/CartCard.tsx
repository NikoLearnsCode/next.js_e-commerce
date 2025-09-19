// components/shared/cards/CartCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {X, Minus, Plus} from 'lucide-react';
import {motion} from 'framer-motion';
import {formatPrice} from '@/utils/formatPrice';
import SpinningLogo from '@/components/shared/ui/SpinningLogo';
import type {CartItemWithProduct} from '@/lib/types/db-types';

type CartCardProps = {
  item: CartItemWithProduct;
  onRemove: (cartItemId: string) => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
};

export default function CartCard({
  item,
  onRemove,
  onUpdateQuantity,
  isUpdating = false,
  isRemoving = false,
}: CartCardProps) {
  const {id, name, price, slug, images, quantity, size, color, brand} = item;

  return (
    <motion.div
      key={id}
      className='flex flex-row sm:flex-col pb-1 md:pb-0 overflow-hidden'
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
      <div className='relative min-w-2/3 w-full h-full aspect-7/9 group'>
        <Link
          className='block h-full w-full relative'
          tabIndex={-1}
          href={`/${slug}`}
        >
          {images && images[0] ? (
            <Image
              src={images[0]}
              alt={name}
              fill
              quality={90}
              priority
              className='object-cover w-full h-full'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-400'>
              Ingen bild
            </div>
          )}
        </Link>

        <button
          className='absolute transition-all duration-300 top-1 group-active:bg-white/50 group-hover:bg-white/50 right-1 z-1 hover:text-red-900 p-2 cursor-pointer'
          onClick={() => onRemove(id)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <SpinningLogo width='22' height='16' />
          ) : (
            <X size={20} strokeWidth={1} />
          )}
        </button>
      </div>

      <div className='px-3 py-2 relative min-w-1/3 lg:pb-10 lg:px-3 flex flex-col mb-2'>
        <div className='flex flex-col flex-1 gap-1 sm:gap-0 justify-center items-center sm:items-start text-sm'>
          <Link
            href={`/${slug}`}
            className='outline-none focus:underline focus:underline-offset-2 text-wrap text-break text-center'
          >
            {name}
          </Link>
          <span className='text-black/80 text-sm'>
            {typeof price === 'string'
              ? formatPrice(Number(price))
              : formatPrice(price || 0)}
          </span>
        </div>

        <div className='text-sm mt-1 gap-2 md:text-base flex flex-col sm:flex-row items-center'>
          {onUpdateQuantity && quantity && (
            <div className='flex items-center gap-2 pr-2  justify-center'>
              <button
                onClick={() => onUpdateQuantity(id, quantity - 1)}
                disabled={isUpdating || quantity <= 1}
                className={`h-8 w-8 flex items-center justify-center ${
                  quantity <= 1
                    ? 'pointer-events-none opacity-30'
                    : 'cursor-pointer'
                }`}
              >
                <Minus
                  strokeWidth={1.25}
                  className={`w-4.5 h-4.5 ${isUpdating ? 'cursor-not-allowed' : ''}`}
                />
              </button>

              <span className='text-[13px]'>{quantity}</span>

              <button
                onClick={() => onUpdateQuantity(id, quantity + 1)}
                disabled={isUpdating}
                className='h-8 w-8 flex items-center justify-center cursor-pointer'
              >
                <Plus
                  strokeWidth={1.25}
                  className={`w-4.5 h-4.5 ${isUpdating ? 'cursor-not-allowed' : ''}`}
                />
              </button>
            </div>
          )}
          <div className='flex gap-3 flex-wrap px-4 sm:px-0 sm:gap-4 text-[13px]'>
            {size && <span>{size}</span>}

            {brand && <span>{brand}</span>}
            {color && <span>{color}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
