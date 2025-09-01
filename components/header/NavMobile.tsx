'use client';
import {useState, useEffect} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {NavLink} from '@/lib/types/category';
import {ArrowLeft} from 'lucide-react';
import {AnimatePresence} from 'framer-motion';
import {
  MotionDropdown,
  MotionOverlay,
  MotionCloseX,
} from '@/components/shared/AnimatedSidebar';

// Helper-funktion är oförändrad
const findInitialCategory = (navLinks: NavLink[], pathname: string): number => {
  if (!navLinks) return 0;
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

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // STEG 1: Byt ut det gamla statet mot en "navigeringsstack".
  // Denna array håller reda på vilken nivå användaren är på.
  const [navigationStack, setNavigationStack] = useState<NavLink[]>([]);

  useEffect(() => {
    setActiveCategoryIndex(findInitialCategory(navLinks, pathname));
    // Återställ stacken om huvudkategorin ändras via sidnavigering
    setNavigationStack([]);
  }, [navLinks, pathname]);

  // STEG 2: Bestäm vad som ska visas baserat på stacken.
  const currentLevel = navigationStack[navigationStack.length - 1];
  const activeTopLevelCategory = navLinks[activeCategoryIndex];
  // Om stacken är tom, visa huvudmenyn. Annars, visa barnen till det sista objektet i stacken.
  const linksToDisplay =
    currentLevel?.children ?? activeTopLevelCategory?.children ?? [];
  const currentTitle = currentLevel?.title ?? activeTopLevelCategory?.title;

  const toggleMenu = () => {
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setNavigationStack([]); // Återställ alltid stacken vid stängning
    document.body.style.overflow = '';
  };

  // STEG 3: Förenklade funktioner för att navigera
  const handleLinkClick = (link: NavLink) => {
    // Om länken är en mapp (har barn), gå djupare in i stacken.
    if (link.isFolder) {
      setNavigationStack((prevStack) => [...prevStack, link]);
    } else {
      // Om det är en vanlig länk, stäng menyn.
      closeMenu();
    }
  };

  const goBack = () => {
    // Ta bort det sista objektet från stacken för att gå ett steg tillbaka.
    setNavigationStack((prevStack) => prevStack.slice(0, -1));
  };

  const changeCategory = (index: number) => {
    setActiveCategoryIndex(index);
    setNavigationStack([]); // Återställ stacken när man byter huvudkategori
  };

  // ... useEffects för Escape-tangent och skärmstorlek är i princip oförändrade ...
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) closeMenu();
    };
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!navLinks || navLinks.length === 0) return null;

  return (
    <nav className='relative uppercase'>
      <button
        onClick={toggleMenu}
        className='flex flex-col gap-1 py-2 items-center group relative focus:outline-none cursor-pointer'
        aria-label={isMenuOpen ? 'Stäng meny' : 'Öppna meny'}
      >
        <span className='w-6 border-t-[1.4px] border-black'></span>
        <span className='w-6 border-t-[1.4px] border-black'></span>
        <span className='w-6 border-t-[1.4px] border-black'></span>
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <MotionOverlay
              key='mobile-overlay'
              onClick={closeMenu}
              withDelay={true}
            />
            <MotionDropdown
              position='newLeft'
              key='mobile-dropdown'
              isMobile={true}
              className='overflow-y-auto'
            >
              {/* Huvudkategorier (Dam, Herr etc.) visas alltid */}
              <ul className='flex uppercase px-2 text-sm font-semibold font-syne py-5 items-center'>
                {navLinks.map((link, index) => (
                  <li
                    key={link.title}
                    onClick={() => changeCategory(index)}
                    className={`mx-3 cursor-pointer border-b ${activeCategoryIndex === index ? 'text-black border-black' : 'text-gray-500 border-transparent'}`}
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

              {/* STEG 4: En enda, dynamisk vy istället för en komplex ternary */}
              <div className='p-2 pt-5'>
                {/* Visa "Tillbaka"-knapp om vi inte är på första nivån */}
                {navigationStack.length > 0 && (
                  <div className='flex items-center mb-6'>
                    <button
                      onClick={goBack}
                      className='text-sm font-medium pl-3 pr-2 border-b border-transparent hover:border-black transition'
                    >
                      <ArrowLeft
                        strokeWidth={1}
                        className='w-5 h-5 inline text-gray-600'
                      />
                    </button>
                    <span className='text-[11px] font-semibold text-gray-600'>
                      {currentTitle}
                    </span>
                  </div>
                )}

                {/* Rendera länkarna för den nuvarande nivån */}
                <ul className='space-y-4 text-sm'>
                  {linksToDisplay.map((link) => (
                    <li key={link.href} className='not-first:pt-2'>
                      {link.isFolder ? (
                        <button
                          onClick={() => handleLinkClick(link)}
                          className='block mx-4 font-medium border-b border-transparent active:border-b active:border-black uppercase w-fit transition text-left'
                        >
                          {link.title}
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => handleLinkClick(link)}
                          className='block mx-4 font-medium border-b border-transparent active:border-b active:border-black w-fit transition'
                        >
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </MotionDropdown>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
