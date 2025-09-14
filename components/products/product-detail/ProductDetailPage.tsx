'use client';

import Image from 'next/image';
import AddToCartButton from '@/components/products/product-detail/AddToCartButton';
import {twMerge} from 'tailwind-merge';
import type {ProductDetail, CarouselCard} from '@/lib/types/db';
import {useState} from 'react';
import Newsletter from '@/components/shared/Newsletter';
import FavoriteButton from '@/components/favorites/FavoriteButton';

import MobileImageSwiper from './MobileImageSwiper';
import dynamic from 'next/dynamic';
import Carousel from '@/components/shared/Carousel';
import NewBadge from '@/components/shared/NewBadge';

const CarouselProductCard = dynamic(
  () => import('@/components/shared/cards/CarouselCard')
);

type ProductPageProps = {
  product: ProductDetail;
  categoryProducts?: CarouselCard[];
  genderProducts?: CarouselCard[];
  onCartClick?: () => void;
  initial?: boolean;
};

export default function ProductPage({
  product,
  categoryProducts = [],
  genderProducts = [],
}: ProductPageProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const initialImageIndex = 0;
  const [activeImageIndex, setActiveImageIndex] = useState(initialImageIndex);

  const handleAddToCartSuccess = () => {
    setSelectedSize(null);
  };

  return (
    <>
      <div className='w-full mx-auto lg:pt-4 lg:pb-8 '>
        <div className='flex  flex-col justify-center gap-4  lg:gap-8 lg:flex-row xl:gap-10 '>
          {/* Left column - images */}
          <div className='h-full w-full '>
            {product.images && product.images.length > 0 ? (
              <div className='flex flex-col justify-start w-full'>
                {/* Mobile view - Only rendered in the DOM on mobile */}
                <div className='lg:hidden'>
                  <MobileImageSwiper
                    images={product.images}
                    productName={product.name}
                    activeIndex={activeImageIndex}
                    initialSlide={initialImageIndex}
                    onSlideChange={setActiveImageIndex}
                  />
                </div>

                {/* Desktop view - Display all images in a grid */}
                <div className='hidden flex-1 lg:grid md lg:grid-cols-2 lg:gap-0.5 '>
                  {product.images.map((img: string, idx: number) => (
                    <div key={idx} className='relative  aspect-[7/9]'>
                      <Image
                        src={img}
                        alt={`${product.name} - bild ${idx + 1}`}
                        fill
                        quality={100}
                        sizes='(min-width: 1024px) 30vw, 0vw'
                        priority={true}
                        loading='eager'
                        className='object-cover  max-h-full '
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='w-full bg-gray-200 flex items-center justify-center h-[500px]'>
                <span className='text-gray-500'>Ingen bild tillgänglig</span>
              </div>
            )}
          </div>

          {/* Right column - product info */}
          <div className='flex  flex-col lg:pt-12 px-5 lg:px-0 2xl:px-4 lg:mr-7 sticky top-18 h-full   gap-3 lg:gap-1 mb-10   lg:w-[35%] transition-all duration-300'>
            {/* Product name */}
            <div className='flex relative items-center justify-between gap-1'>
              <h1 className='text-lg sm:text-xl mt-2 lg:mt-4 font-medium'>
                {product.name}
              </h1>
              <span className='absolute -top-2 left-0'>
                {product.isNew && <NewBadge />}
              </span>
              {/* <p className='text-gray-700 font-semibold uppercase font-syne text-sm'>
                {product.brand}
              </p> */}
            </div>

            <div className='text-lg  lg:my-3 text-gray-800 '>
              {product.price} kr
            </div>
            <div className='flex items-center gap-1 text-sm '>
              <p className='text-sm text-black '>
                {product.color &&
                  product.color.charAt(0).toUpperCase() +
                    product.color.slice(1)}
              </p>
            </div>

            {/* Size */}
            <div className='flex flex-col  gap-2'>
              <div className='h-5'>
                {showSizeWarning && !selectedSize && (
                  <p className='text-red-900 text-xs pt-2  font-semibold'>
                    Vänligen välj en storlek
                  </p>
                )}
              </div>
              <div className='flex items-center flex-wrap'>
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    className={twMerge(
                      'h-12 w-16 p-0 m-0 border appearance-none text-sm  hover:border-black active:border-black transition border-gray-200 cursor-pointer',
                      selectedSize === size
                        ? 'border border-black bg-gray-100'
                        : ''
                    )}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeWarning(false);
                    }}
                    disabled={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart and favorites buttons */}
            <div className='flex gap-1 mt-1 items-center'>
              <AddToCartButton
                product={product}
                quantity={1}
                selectedSize={selectedSize || ''}
                onAddSuccess={handleAddToCartSuccess}
                className='flex-1 h-13 text-sm m-0 font-semibold transition duration-300 rounded-none'
                onSizeMissing={() => setShowSizeWarning(true)}
              />
              <FavoriteButton
                product={product}
                size={20}
                strokeWidth={2}
                className='border  border-black/20 hover:border-black/60 rounded-xs h-13 p-0 w-13 text-white'
              />
            </div>
          </div>
        </div>
      </div>
      <div className=' px-5 pb-20 lg:pb-36 lg:px-10 lg:w-[65%]'>
        <h5 className='uppercase sm:text-base text-sm   mb-1 font-medium'>
          Beskrivning
        </h5>
        <p className='text-gray-800 font-normal sm:text-base text-sm   '>
          {product.description}
        </p>
      </div>
      {/* Products in the same category */}
      {categoryProducts.length > 0 && (
        <div className='mx-auto  pb-8'>
          <Carousel
            items={categoryProducts}
            titelDivClassName='px-4 md:px-6'
            title='Liknande produkter'
            renderItem={(product) => (
              <CarouselProductCard product={product} priorityLoading={false} />
            )}
            id='carousel-one'
          />
        </div>
      )}

      {/* Products for the same gender */}
      {genderProducts.length > 0 && (
        <div className='mx-auto py-8'>
          <Carousel
            items={genderProducts}
            title='Du kanske också gillar'
            titelDivClassName='px-4 md:px-6'
            renderItem={(product) => (
              <CarouselProductCard product={product} priorityLoading={false} />
            )}
            id='carousel-two'
          />
        </div>
      )}
      <Newsletter />
    </>
  );
}
