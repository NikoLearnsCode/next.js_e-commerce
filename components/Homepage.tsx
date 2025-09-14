'use client';

import Image from 'next/image';
import {Link} from '@/components/shared/ui/link';
import {useState} from 'react';
import {NavLink, MainCategoryWithImages} from '@/lib/types/category';

export default function Homepage({
  navLinks,
  mainCategories,
}: {
  navLinks: NavLink[];
  mainCategories: MainCategoryWithImages[];
}) {
  const [currentView, setCurrentView] = useState<string>(() => {
    // Försök Dam först
    const dam = mainCategories.find((cat) => cat.slug === 'dam');
    if (dam && (dam.desktopImage || dam.mobileImage)) return 'dam';

    // Annars första kategorin med bilder
    const first = mainCategories.find(
      (cat) => cat.desktopImage || cat.mobileImage
    );
    return first?.slug || 'dam'; // Fallback till 'dam' för hårdkodade bilder
  });

  // Hover handlers - byt bara bild om kategorin har bilder
  const handleLinkHover = (categorySlug: string) => {
    const category = mainCategories.find((cat) => cat.slug === categorySlug);
    if (category && (category.desktopImage || category.mobileImage)) {
      setCurrentView(categorySlug);
    }
  };

  return (
    <div className='relative'>
      <div className='relative min-h-[calc(100vh-56px)]'>
        {/* Mobile bilder */}
        <div className='sm:hidden absolute w-full h-full'>
          {mainCategories.map((category, index) => {
            // Hoppa över kategorier utan bilder
            if (!category.desktopImage && !category.mobileImage) return null;

            const fallbackMobile = `/images/LP.${category.slug.toUpperCase()}.MOBILE.avif`;
            const mobileImage = category.mobileImage || fallbackMobile;

            return (
              <Image
                key={`mobile-${category.slug}`}
                src={mobileImage}
                alt={`Landing-Page-${category.name}-Mobil`}
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes='90vw'
                quality={90}
                className={`object-cover object-top w-full h-full absolute top-0 left-0 transition-opacity duration-500 ${
                  currentView === category.slug ? 'opacity-100' : 'opacity-0'
                }`}
              />
            );
          })}
        </div>

        {/* Desktop bilder */}
        <div className='hidden sm:block w-full h-full absolute'>
          {mainCategories.map((category, index) => {
            // Hoppa över kategorier utan bilder
            if (!category.desktopImage && !category.mobileImage) return null;

            const fallbackDesktop = `/images/LP.${category.slug.toUpperCase()}.avif`;
            const desktopImage = category.desktopImage || fallbackDesktop;

            return (
              <Image
                key={`desktop-${category.slug}`}
                src={desktopImage}
                alt={`Landing-Page-${category.name}`}
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes='90vw'
                quality={90}
                className={`object-cover w-full h-full absolute top-0 left-0 transition-opacity duration-700 ${
                  currentView === category.slug ? 'opacity-100' : 'opacity-0'
                }`}
              />
            );
          })}
        </div>
      </div>
      <div className='absolute left-0 top-5/8 w-full px-6'>
        <div className='flex justify-center items-center space-x-1 uppercase'>
          {navLinks
            .filter((link) => link.href !== '/')
            .map((link) => {
              // Extrahera kategorislug från href (/c/dam -> dam)
              const categorySlug = link.href.replace('/c/', '');
              const isActive = currentView === categorySlug;

              return (
                <Link
                  variant='underline'
                  className={`focus:no-underline h-8 decoration-1 underline-offset-6 text-white text-base tracking-wide font-syne font-medium relative z-10 ${
                    isActive ? 'underline' : ''
                  }`}
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => handleLinkHover(categorySlug)}
                >
                  {link.title}
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
