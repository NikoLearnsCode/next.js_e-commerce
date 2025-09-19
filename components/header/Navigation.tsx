'use client';

import React, {useEffect, useRef, useState, useMemo} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowLeft} from 'lucide-react';
import {NavLink} from '@/lib/types/category-types';
import {useMediaQuery} from '@/hooks/useMediaQuery';
import {
  MotionCloseX,
  MotionOverlay,
  MotionDropdown,
} from '@/components/shared/AnimatedSidebar';

// ============================================================================
//   DESKTOP-NAVIGERING
// ============================================================================
function DesktopNavView({navLinks}: {navLinks: NavLink[]}) {
  const [activePath, setActivePath] = useState<number[]>([]);
  const pathname = usePathname();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const candidateIndexRef = useRef<number | null>(null);

  const isActivePath = (href: string) => {
    if (href === '#' || !href) return false;
    if (href === '/' && pathname === '/') return true;
    return href !== '/' && pathname.startsWith(href);
  };

  const closeDropdown = () => {
    setActivePath([]);
    candidateIndexRef.current = null;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMainMenuHover = (index: number): void => {
    candidateIndexRef.current = index;
    if (activePath.length === 0) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        if (candidateIndexRef.current === index) {
          setActivePath([index]);
        }
      }, 200);
    } else {
      setActivePath([index]);
    }
  };

  const handleSubMenuHover = (level: number, index: number) => {
    setActivePath([...activePath.slice(0, level + 1), index]);
  };

  const handleMainMenuLeave = () => {
    if (activePath.length === 0) {
      candidateIndexRef.current = null;
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    }
  };

  const handleClick = () => {
    setTimeout(() => closeDropdown(), 300);
  };

  const handleKeyOpen = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    index: number
  ) => {
    if (e.key === 'Enter') setActivePath([index]);
  };

  useEffect(() => {
    document.body.style.overflow = activePath.length > 0 ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activePath]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDropdown();
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  const columnsToRender = useMemo(() => {
    const columns: NavLink[][] = [];
    if (activePath.length > 0) {
      let currentChildren = navLinks[activePath[0]]?.children;
      if (currentChildren) columns.push(currentChildren);

      for (let i = 1; i < activePath.length; i++) {
        const nextChildren = currentChildren?.[activePath[i]]?.children;
        if (nextChildren && nextChildren.length > 0) {
          columns.push(nextChildren);
          currentChildren = nextChildren;
        } else {
          break;
        }
      }
    }
    return columns;
  }, [activePath, navLinks]);

  const shouldExpand =
    columnsToRender.length > 1 && columnsToRender.some((col) => col.length > 0);

  return (
    <nav className='uppercase'>
      <ul className='flex items-center gap-2 justify-center relative z-50 '>
        {navLinks.map((link, index) => (
          <li
            key={link.title}
            onMouseEnter={() => handleMainMenuHover(index)}
            onMouseLeave={handleMainMenuLeave}
            className='text-sm font-semibold cursor-pointer font-syne'
          >
            <Link href={link.href || ''} onClick={handleClick}>
              <span
                className={`pb-0.5 ${
                  activePath.length === 0 && isActivePath(link.href || '')
                    ? 'text-black border-b delay-50 border-black'
                    : activePath[0] === index
                      ? 'text-black border-b border-black hover:border-black'
                      : activePath.length > 0
                        ? 'text-gray-500'
                        : ''
                }`}
              >
                {link.title}
              </span>
            </Link>
            {/*   {link.isFolder && ( */}
            <span
              onKeyDown={(e) => handleKeyOpen(e, index)}
              tabIndex={0}
              className='inline-flex w-3 justify-center items-center focus:text-black text-white cursor-default'
            >
              ˅
            </span>
            {/* )} */}
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {activePath.length > 0 && (
          <>
            <motion.div
              key='desktop-dropdown'
              onMouseLeave={closeDropdown}
              className='fixed left-0 top-0 h-full bg-white z-40 shadow-md pt-19 pl-8'
              initial={{clipPath: 'inset(0% 100% 0% 0%)'}}
              animate={{
                clipPath: 'inset(0% 0% 0% 0%)',
                width: shouldExpand ? '450px' : '330px',
              }}
              exit={{clipPath: 'inset(0% 100% 0% 0%)'}}
              transition={{type: 'tween', ease: 'easeOut', duration: 0.3}}
            >
              <div className='absolute top-1 right-1'>
                <MotionCloseX
                  size={14}
                  strokeWidth={1.5}
                  className='p-5'
                  onClick={closeDropdown}
                />
              </div>

              <div className='flex h-full'>
                {columnsToRender.map((columnItems, columnIndex) => (
                  <div key={columnIndex} className='min-w-[180px] pr-8'>
                    <ul className='flex flex-col overflow-y-auto text-nowrap space-y-6'>
                      {columnItems.map((item, itemIndex) => {
                        const isActive =
                          activePath[columnIndex + 1] === itemIndex;
                        return (
                          <li
                            key={item.title}
                            onMouseEnter={() =>
                              handleSubMenuHover(columnIndex, itemIndex)
                            }
                          >
                            {item.isFolder ? (
                              <span
                                className={`cursor-pointer transition focus:border-black outline-none block not-first:pt-2 text-sm font-medium border-b border-transparent hover:border-b hover:border-black w-fit ${
                                  isActive
                                    ? 'text-black !border-b opacity-70 !border-black'
                                    : columnsToRender.length > columnIndex + 1
                                      ? 'opacity-50'
                                      : ''
                                }`}
                              >
                                {item.title}
                              </span>
                            ) : (
                              <Link
                                href={item.href || ''}
                                onClick={handleClick}
                                className={`transition focus:border-black outline-none block text-sm font-medium border-b border-transparent hover:border-b hover:border-black w-fit ${
                                  columnsToRender.length > columnIndex + 1
                                    ? 'opacity-50'
                                    : ''
                                }
                                ${
                                  item.title === 'Nyheter'
                                    ? 'text-red-800 hover:border-red-800'
                                    : ''
                                }`}
                              >
                                {item.title}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
            <MotionOverlay key='desktop-overlay' onClick={closeDropdown} />
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ============================================================================
//   MOBIL-NAVIGERING
// ============================================================================
const findInitialCategory = (navLinks: NavLink[], pathname: string): number => {
  for (let i = 0; i < navLinks.length; i++) {
    if (
      (navLinks[i].href === '/' && pathname === '/') ||
      (navLinks[i].href !== '/' && pathname.startsWith(navLinks[i].href || ''))
    ) {
      return i;
    }
  }
  return 0;
};

function MobileNavView({navLinks}: {navLinks: NavLink[]}) {
  const pathname = usePathname();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(
    findInitialCategory(navLinks, pathname)
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState<NavLink[]>([]);

  useEffect(() => {
    setActiveCategoryIndex(findInitialCategory(navLinks, pathname));
    setNavigationStack([]);
  }, [navLinks, pathname]);

  const currentLevel = navigationStack[navigationStack.length - 1];
  const activeTopLevelCategory = navLinks[activeCategoryIndex];
  const linksToDisplay =
    currentLevel?.children ?? activeTopLevelCategory?.children ?? [];
  const currentTitle = currentLevel?.title ?? activeTopLevelCategory?.title;

  const toggleMenu = () => {
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setNavigationStack([]);
    document.body.style.overflow = '';
  };

  const handleLinkClick = (link: NavLink) => {
    if (link.isFolder) {
      setNavigationStack((prevStack) => [...prevStack, link]);
    } else {
      closeMenu();
    }
  };

  const goBack = () => {
    setNavigationStack((prevStack) => prevStack.slice(0, -1));
  };

  const changeCategory = (index: number) => {
    setActiveCategoryIndex(index);
    setNavigationStack([]);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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
              <ul className='flex uppercase px-2 text-sm font-semibold font-syne py-5 items-center'>
                {navLinks.map((link, index) => (
                  <li
                    key={link.title}
                    onClick={() => changeCategory(index)}
                    className={`mx-3 cursor-pointer border-b ${
                      activeCategoryIndex === index
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

              <div className='p-2 pt-5'>
                {navigationStack.length > 0 && (
                  <div className='flex items-center mb-6'>
                    <button
                      onClick={goBack}
                      className='text-sm font-medium pl-3 pr-2    transition'
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
                <ul className='space-y-4 text-sm'>
                  {linksToDisplay.map((link) => (
                    <li key={link.href + link.title} className='not-first:pt-2'>
                      {link.isFolder ? (
                        <button
                          onClick={() => handleLinkClick(link)}
                          className='block mx-4 font-medium border-b border-transparent active:border-b active:border-black uppercase w-fit transition text-left'
                        >
                          {link.title}
                        </button>
                      ) : (
                        <Link
                          href={link.href || ''}
                          onClick={() => handleLinkClick(link)}
                          className={`block mx-4 font-medium border-b border-transparent active:border-b active:border-black w-fit transition ${
                            link.title === 'Nyheter'
                              ? 'text-red-800 hover:border-red-800'
                              : ''
                          }`}
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

// ============================================================================
//   HUVUDKOMPONENT
// ============================================================================
export default function Navigation({navLinks}: {navLinks: NavLink[]}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  if (!navLinks || navLinks.length === 0) {
    return null;
  }

  return isDesktop ? (
    <DesktopNavView navLinks={navLinks} />
  ) : (
    <MobileNavView navLinks={navLinks} />
  );
}
