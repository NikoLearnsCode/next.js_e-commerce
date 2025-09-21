'use client';

import Image from 'next/image';
import {Link} from '@/components/shared/ui/link';
import {useState} from 'react';
import {Category} from '@/lib/types/category-types';

export default function Homepage({
  mainCategories,
}: {
  mainCategories: Category[];
}) {
  const [currentView, setCurrentView] = useState<string>(() => {
    const dam = mainCategories.find((cat) => cat.slug === 'dam');
    if (dam && (dam.desktopImage || dam.mobileImage)) return 'dam';

    const first = mainCategories.find(
      (cat) => cat.desktopImage || cat.mobileImage
    );
    return first?.slug || 'dam';
  });

  const handleLinkHover = (categorySlug: string) => {
    const category = mainCategories.find((cat) => cat.slug === categorySlug);
    if (category && category.desktopImage && category.mobileImage) {
      setCurrentView(categorySlug);
    }
  };

  return (
    <div className='relative'>
      <div className='relative min-h-[calc(100vh-56px)]'>
        {/* Mobile bilder */}
        <div className='sm:hidden absolute w-full h-full'>
          {mainCategories.map((category, index) => {
            if (!category.mobileImage) return null;

            return (
              <Image
                key={`mobile-${category.slug}`}
                src={category.mobileImage}
                alt={`Landing-Page-${category.name}-Mobil`}
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes='90vw'
                quality={90}
                className={`object-cover object-top w-full h-full absolute top-0 left-0 delay-500 ${
                  currentView === category.slug ? 'opacity-100' : 'opacity-0'
                }`}
              />
            );
          })}
        </div>

        {/* Desktop bilder */}
        <div className='hidden sm:block w-full h-full absolute'>
          {mainCategories.map((category, index) => {
            if (!category.desktopImage) return null;
            return (
              <Image
                key={`desktop-${category.slug}`}
                src={category.desktopImage}
                alt={`Landing-Page-${category.name}`}
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes='90vw'
                quality={90}
                className={`object-cover w-full h-full absolute transition-opacity duration-500 top-0 left-0  ${
                  currentView === category.slug ? 'opacity-100' : 'opacity-0'
                }`}
              />
            );
          })}
        </div>
      </div>
      <div className='absolute left-0 top-5/8 w-full px-6'>
        <div className='flex justify-center items-center  uppercase'>
          {mainCategories.map((category) => {
            return (
              <Link
                variant='underline'
                className={`focus:no-underline h-8 decoration-1 underline-offset-6 text-white text-sm tracking-wide font-syne font-semibold relative z-10 `}
                key={category.id}
                href={`/c/${category.slug}`}
                onMouseEnter={() => handleLinkHover(category.slug)}
                onTouchStart={() => handleLinkHover(category.slug)}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
