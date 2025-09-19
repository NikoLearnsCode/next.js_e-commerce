'use client';

import Image from 'next/image';
import {useCart} from '@/context/CartProvider';
import {useState} from 'react';
import {formatPrice} from '@/utils/formatPrice';
import ProductModal from '../shared/ProductModal';

export default function ProductListMobile() {
  const {cartItems, itemCount, totalPrice} = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='pb-2 pt-3 overflow-hidden border border-gray-200'>
        <span className='flex justify-between items-center px-4'>
          <h2 className='font-medium text-sm'>DIN VARUKORG ({itemCount})</h2>
          <button
            className='text-[15px] cursor-pointer font-semibold underline underline-offset-2'
            onClick={openModal}
          >
            Visa
          </button>
        </span>
        <div className='pt-4 flex gap-2 p-3'>
          {cartItems.map((item) => (
            <div key={item.id} className=''>
              <div className='w-30 h-40 relative bg-gray-50'>
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  fill
                  priority
                  sizes='auto'
                  className='object-contain'
                />
                {item.quantity > 1 && (
                  <span className='absolute top-0 left-0 bg-white text-black px-2 py-1 text-xs'>
                    {item.quantity}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className='px-4 mt-2 text-base font-medium'>
          <span className='text-sm'>Totalt: {''}</span>
          {formatPrice(totalPrice)}
        </div>
      </div>

      <ProductModal closeMenu={closeModal} isOpen={isModalOpen} />
    </>
  );
}
