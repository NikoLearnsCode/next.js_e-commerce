'use client';

import Image from 'next/image';
import Link from 'next/link';
import {X, Minus, Plus} from 'lucide-react';
import {motion} from 'framer-motion';
import {formatPrice} from '@/utils/helpers';
import SpinningLogo from '@/components/shared/SpinningLogo';

type BaseItem = {
  id: string;
  name: string;
  price: string | number;
  slug: string;
  images: string[];
  brand?: string;
  color?: string;
};

type CartItemType = BaseItem & {
  quantity: number;
  size: string;
};

type FavoriteItemType = {
  id: string;
  product_id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: Date | null;
  product_info: {
    name: string;
    price: string;
    slug: string;
    images: string[];
    brand: string;
    gender: string;
    category: string;
    color: string;
  };
};

type ProductListItemProps = {
  item: CartItemType | FavoriteItemType;
  type: 'cart' | 'favorite';
  isUpdating?: boolean;
  isRemoving?: boolean;
  onRemove: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
};

export default function ProductListItem({
  item,
  type,
  isUpdating = false,
  isRemoving = false,
  onRemove,
  onUpdateQuantity,
}: ProductListItemProps) {
  // Extract common properties
  const getItemData = () => {
    if (type === 'cart') {
      const cartItem = item as CartItemType;
      return {
        id: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        slug: cartItem.slug,
        images: cartItem.images,
        brand: cartItem.brand,
        color: cartItem.color,
        quantity: cartItem.quantity,
        size: cartItem.size,
      };
    } else {
      const favItem = item as FavoriteItemType;
      return {
        id: favItem.id,
        name: favItem.product_info.name,
        price: favItem.product_info.price,
        slug: favItem.product_info.slug,
        images: favItem.product_info.images,
        brand: favItem.product_info.brand,
        color: favItem.product_info.color,
        productId: favItem.product_id,
      };
    }
  };

  const itemData = getItemData();

  return (
    <motion.div
      key={itemData.id}
      className='flex flex-row sm:flex-col pb-4 mb-4 sm:mb-0 border-b border-gray-50 sm:border-none overflow-hidden '
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
        <Link tabIndex={-1} href={`/${itemData.slug}`}>
          {itemData.images[0] ? (
            <Image
              src={itemData.images[0]}
              alt={itemData.name}
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
          className='absolute top-0 right-0 z-1 hover:text-red-800 p-3 cursor-pointer'
          onClick={() =>
            type === 'cart'
              ? onRemove(itemData.id)
              : onRemove((itemData as any).productId)
          }
          disabled={isRemoving || isUpdating}
        >
          {isRemoving || isUpdating ? (
            <SpinningLogo width='24' height='17' />
          ) : (
            <X size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>

      <div className='px-3 py-2 relative min-w-1/3 lg:pb-10 lg:px-2.5 flex flex-col mb-2'>
        <div className='flex flex-col flex-1 gap-1 sm:gap-0 justify-center items-center sm:items-start text-sm '>
          <Link
            href={`/${itemData.slug}`}
            className='outline-none focus:underline focus:underline-offset-2 text-wrap text-break text-center  '
          >
            {itemData.name}
          </Link>
          <span className='text-black/80 text-sm '>
            {typeof itemData.price === 'string'
              ? formatPrice(Number(itemData.price))
              : formatPrice(itemData.price)}
          </span>
        </div>

        <div className='text-sm mt-1 gap-2 md:text-base flex flex-col sm:flex-row items-center'>
          {type === 'cart' && onUpdateQuantity && (
            <div className='flex items-center gap-2 pr-2 justify-center'>
              <button
                onClick={() =>
                  onUpdateQuantity(itemData.id, itemData.quantity! - 1)
                }
                disabled={isUpdating || itemData.quantity! <= 1}
                className={`h-8 w-8 flex items-center justify-center ${
                  itemData.quantity! <= 1
                    ? 'pointer-events-none opacity-30'
                    : 'cursor-pointer'
                }`}
              >
                <Minus
                  strokeWidth={1.25}
                  className={`w-4.5 h-4.5 ${isUpdating ? 'cursor-not-allowed' : ''}`}
                />
              </button>

              <span className='text-[13px]'>{itemData.quantity}</span>

              <button
                onClick={() =>
                  onUpdateQuantity(itemData.id, itemData.quantity! + 1)
                }
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
          <div className=' flex gap-4 text-[13px]'>
            {type === 'cart' && itemData.size && <span>{itemData.size}</span>}
            {itemData.brand && <span>{itemData.brand}</span>}
            {itemData.color && <span>{itemData.color}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
