'use client';
import {useState, useEffect} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {NavLink} from '@/lib/types/category-types';
import {ArrowLeft} from 'lucide-react';
import {AnimatePresence} from 'framer-motion';
import {
  MotionDropdown,
  MotionOverlay,
  MotionCloseX,
} from '@/components/shared/AnimatedSidebar';

// Helper-funktion som säkert hanterar undefined navLinks
const findInitialCategory = (navLinks: NavLink[], pathname: string): number => {
  if (!navLinks) {
    return 0;
  }
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

export default function MobileNav({navLinks}: {navLinks: NavLink[]}) {
  const pathname = usePathname();

  // Initialisera med ett säkert standardvärde
  const [activeCategory, setActiveCategory] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showingSubSub, setShowingSubSub] = useState(false);
  const [activeSubIndex, setActiveSubIndex] = useState<number | null>(null);

  // Använd useEffect för att uppdatera state när navLinks eller pathname ändras
  useEffect(() => {
    setActiveCategory(findInitialCategory(navLinks, pathname));
  }, [navLinks, pathname]);

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    if (newMenuState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowingSubSub(false);
    setActiveSubIndex(null);
    document.body.style.overflow = '';
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  const changeCategory = (index: number) => {
    setActiveCategory(index);
    setShowingSubSub(false);
    setActiveSubIndex(null);
  };

  const openSubSub = (subIndex: number) => {
    setActiveSubIndex(subIndex);
    setShowingSubSub(true);
  };

  const backToSub = () => {
    setShowingSubSub(false);
    setActiveSubIndex(null);
  };

  const handleSubClick = (subLink: any, subIndex: number) => {
    if (subLink.children && subLink.children.length > 0) {
      openSubSub(subIndex);
    } else {
      closeMenu();
    }
  };

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

  if (!navLinks || navLinks.length === 0) {
    return null; // Renderar inget om det inte finns några länkar
  }

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
            <MotionOverlay key='mobile-overlay' withDelay={true} />

            <MotionDropdown
              position='newLeft'
              key='mobile-dropdown'
              isMobile={true}
              className='overflow-y-auto'
            >
              <ul className='flex uppercase px-2  text-sm  font-semibold font-syne py-5 items-center '>
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
                  className='p-5'
                  strokeWidth={1.5}
                />
              </div>

              <div className='p-2 pt-5 '>
                {showingSubSub && activeSubIndex !== null ? (
                  // SubSub View
                  <div>
                    <div className='flex items-center mb-6'>
                      <button
                        onClick={backToSub}
                        className='text-sm font-medium pl-3 pr-2 border-b border-transparent hover:border-black transition'
                      >
                        <ArrowLeft strokeWidth={1} className='w-5 h-5 inline text-gray-600' />
                      </button>
                      <span className='text-[11px]  font-semibold text-gray-600'>
                        {
                          navLinks[activeCategory]?.children?.[activeSubIndex]
                            ?.title
                        }
                      </span>
                    </div>
                    <ul className='space-y-4 text-sm'>
                      {navLinks[activeCategory]?.children?.[
                        activeSubIndex
                      ]?.children?.map((subSubLink) => (
                        <li key={subSubLink.title} className='not-first:pt-2'>
                          <Link
                            href={subSubLink.href}
                            className='block mx-4 font-medium border-b border-transparent active:border-b active:border-black w-fit transition'
                            onClick={closeMenu}
                          >
                            {subSubLink.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  // Sub View
                  <ul className='space-y-4 text-sm '>
                    {navLinks[activeCategory]?.children?.map(
                      (subLink, subIndex) => (
                        <li key={subLink.title} className='not-first:pt-2'>
                          {subLink.children && subLink.children.length > 0 ? (
                            <button
                              onClick={() => handleSubClick(subLink, subIndex)}
                              className={`block mx-4 font-medium border-b border-transparent active:border-b active:border-black uppercase w-fit transition text-left ${
                                subLink.title === 'Nyheter'
                                  ? 'text-red-800 active:border-red-800'
                                  : ''
                              }`}
                            >
                              {subLink.title} 
                            </button>
                          ) : (
                            <Link
                              href={subLink.href}
                              className={`block mx-4 font-medium border-b border-transparent active:border-b active:border-black w-fit transition ${
                                subLink.title === 'Nyheter'
                                  ? 'text-red-800 active:border-red-800'
                                  : ''
                              }`}
                              onClick={() => handleSubClick(subLink, subIndex)}
                            >
                              {subLink.title}
                            </Link>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            </MotionDropdown>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
