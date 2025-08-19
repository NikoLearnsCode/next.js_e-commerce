'use client';
import Image from 'next/image';
import {useCart} from '@/context/CartProvider';
import {useState} from 'react';
import {formatPrice} from '@/lib/helpers';
import {ProductListDropdown} from './DropdownCart';

export function ProductListDesktop() {
  const {cartItems, itemCount, removeItem, removingItems} = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleOpenMenu = () => {
    setIsOpen(true);
  };

  return (
    <div className='hidden md:block space-y-4 pb-3 md:mb-0'>
      <span className='flex justify-between items-center px-4'>
        <h2 className='font-medium text-sm'>DIN VARUKORG ({itemCount})</h2>
        <button
          className='text-[15px]  cursor-pointer font-semibold underline underline-offset-2'
          onClick={handleOpenMenu}
        >
          Visa
        </button>
      </span>
      <div className='space-y-4 max-h-96  overflow-y-auto border border-gray-200 p-3'>
        {cartItems.map((item) => (
          <div
            key={item.id}
            className={`flex gap-4 not-last:border-b pb-2 border-gray-200 ${removingItems[item.id] ? 'opacity-50' : ''}`}
          >
            <div className='relative bg-gray-50 w-25 h-35'>
              <Image
                src={item.images[0]}
                alt={item.name}
                fill
                priority
                className='object-contain '
              />
            </div>
            <div className='flex-1 text-xs'>
              <h3 className='font-medium text-sm'>{item.name}</h3>

              <p className=' text-gray-600'>Storlek: {item.size}</p>
              <p className=' text-gray-600'>{item.color}</p>
              <p className=' text-gray-600'>Antal: {item.quantity}</p>
              <p className=' text-gray-600'>{item.price} kr</p>
            </div>

            <div>
              {cartItems.length > 1 && (
                <button
                  className={`font-medium mr-3 transition border-gray-400 text-black hover:text-red-700 hover:border-red-700  text-xs border-b disabled:opacity-50 cursor-pointer ${removingItems[item.id] ? 'text-red-700 border-red-700 hover:border-red-700' : ''}`}
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

      {isOpen && <ProductListDropdown closeMenu={closeMenu} isOpen={isOpen} />}
    </div>
  );
}

export function ProductListMobile() {
  const {cartItems, itemCount, totalPrice} = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleOpenMenu = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className='pb-2 pt-3 overflow-hidden  border border-gray-200'>
        <span className='flex justify-between items-center px-4'>
          <h2 className='font-medium text-sm'>DIN VARUKORG ({itemCount})</h2>
          <button
            className='text-[15px]  cursor-pointer font-semibold underline underline-offset-2'
            onClick={handleOpenMenu}
          >
            Visa
          </button>
        </span>
        <div className='pt-4  flex gap-2 p-3 '>
          {cartItems.map((item) => (
            <div key={item.id} className=' '>
              <div className='w-30 h-40 relative bg-gray-50'>
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  fill
                  priority
                  sizes='auto'
                  className='object-contain '
                />
                {item.quantity > 1 && (
                  <span className='absolute top-0 left-0 bg-white text-black px-2 py-1  text-xs'>
                    {item.quantity}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className='px-4 mt-2 text-base font-medium'>
          <span className=' text-sm'>Totalt: {''}</span>
          {formatPrice(totalPrice)}
        </div>
      </div>

      {isOpen && <ProductListDropdown closeMenu={closeMenu} isOpen={isOpen} />}
    </>
  );
}
