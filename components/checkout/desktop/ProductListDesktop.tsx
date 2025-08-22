'use client';

import Image from 'next/image';
import {useCart} from '@/context/CartProvider';
import {useState} from 'react';
import ProductModal from '../shared/ProductModal';

export default function ProductListDesktop() {
  const {cartItems, itemCount, removeItem, removingItems} = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='space-y-4 pb-3 md:mb-0'>
        <span className='flex justify-between items-center px-4'>
          <h2 className='font-medium text-sm'>DIN VARUKORG ({itemCount})</h2>
          <button
            className='text-[15px] cursor-pointer font-semibold underline underline-offset-2'
            onClick={openModal}
          >
            Visa
          </button>
        </span>
        <div className='space-y-4 max-h-96 overflow-y-auto border border-gray-200 p-3'>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className={`flex gap-4 not-last:border-b pb-2 border-gray-200 ${
                removingItems[item.id] ? 'opacity-50' : ''
              }`}
            >
              <div className='relative bg-gray-50 w-25 h-35'>
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  fill
                  priority
                  className='object-contain'
                />
              </div>
              <div className='flex-1 text-xs'>
                <h3 className='font-medium text-sm'>{item.name}</h3>
                <p className='text-gray-600'>Storlek: {item.size}</p>
                <p className='text-gray-600'>{item.color}</p>
                <p className='text-gray-600'>Antal: {item.quantity}</p>
                <p className='text-gray-600'>{item.price} kr</p>
              </div>

              <div>
                {cartItems.length > 1 && (
                  <button
                    className={`font-medium mr-3 transition border-gray-400 text-black hover:text-red-700 hover:border-red-700 text-xs border-b disabled:opacity-50 cursor-pointer ${
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
      </div>

      <ProductModal closeMenu={closeModal} isOpen={isModalOpen} />
    </>
  );
}
