'use client';
import {useState, useEffect} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {NavLink} from './NavLinks';

import {AnimatePresence} from 'framer-motion';
import {
  MotionDropdown,
  MotionOverlay,
  MotionCloseX,
} from '@/components/shared/AnimatedDropdown';

interface MobileNavProps {
  navLinks: NavLink[];
}

export default function MobileNav({navLinks}: MobileNavProps) {
  const pathname = usePathname();

  // Hitta index för den kategori som matchar nuvarande URL
  const findInitialCategory = () => {
    for (let i = 0; i < navLinks.length; i++) {
      if (
        (navLinks[i].href === '/' && pathname === '/') ||
        (navLinks[i].href !== '/' && pathname.startsWith(navLinks[i].href))
      ) {
        return i;
      }
    }
    return 0;
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(findInitialCategory);

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    if (newMenuState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Stäng hela menyn
  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  // Ändra aktiv kategori
  const changeCategory = (index: number) => {
    setActiveCategory(index);
  };

  // Uppdatera aktiv kategori när URL ändras
  useEffect(() => {
    setActiveCategory(findInitialCategory());
  }, [pathname]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        document.body.style.overflow = '';
        closeMenu();
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <nav className='relative uppercase '>
      <button
        onClick={toggleMenu}
        className='flex flex-col gap-1 py-2 items-center group relative focus:outline-none cursor-pointer'
        aria-label={isMenuOpen ? 'Stäng meny' : 'Öppna meny'}
      >
        <span className='w-6 border-t-[1.4px] border-black '></span>
        <span className='w-6 border-t-[1.4px] border-black'></span>
        <span className='w-6 border-t-[1.4px] border-black'></span>
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <MotionOverlay key='mobile-overlay' />

            <MotionDropdown
              position='left'
              key='mobile-dropdown'
              isMobile={true}
              className='overflow-y-auto'
            >
              {/* Huvudkategorier och stängningsknapp */}
              <ul className='flex uppercase px-4 pr-6 text-sm  font-semibold font-syne py-5 items-center '>
                {navLinks.map((link, index) => (
                  <li
                    key={link.title}
                    onClick={() => changeCategory(index)}
                    className={`mx-3 cursor-pointer border-b  ${
                      activeCategory === index
                        ? 'text-black border-black'
                        : 'text-gray-500 border-transparent'
                    }`}
                  >
                    {link.title}
                  </li>
                ))}
              </ul>
              <div className='absolute top-0 right-1.5'>
                <MotionCloseX
                  onClick={closeMenu}
                  size={14}
                  withTranslate={true}
                  className='p-5'
                  strokeWidth={1.5}
                />
              </div>

              {/* Undermeny för aktiv kategori */}
              <ul className='p-4 pt-5 space-y-4 text-sm'>
                {navLinks[activeCategory]?.subLinks?.map((subLink) => (
                  <li key={subLink.title} className='not-first:pt-2'>
                    <Link
                      href={subLink.href}
                      className={`block mx-4   border-b border-transparent active:border-b active:border-black w-fit transition ${
                        subLink.title === 'ERBJUDANDEN'
                          ? 'text-red-600 active:border-red-600'
                          : ''
                      } `}
                      onClick={closeMenu}
                    >
                      {subLink.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </MotionDropdown>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
