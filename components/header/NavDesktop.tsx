'use client';
import {useEffect, useRef, useState, useMemo} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {NavLink} from '@/lib/types/category-types';
import {AnimatePresence, motion} from 'framer-motion';
import {MotionCloseX, MotionOverlay} from '@/components/shared/AnimatedSidebar';

export default function DesktopNav({navLinks}: {navLinks: NavLink[]}) {
  const [activePath, setActivePath] = useState<number[]>([]);
  const pathname = usePathname();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const candidateIndexRef = useRef<number | null>(null);

  if (!navLinks || navLinks.length === 0) {
    return null;
  }

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
    const newPath = [...activePath.slice(0, level + 1), index];
    setActivePath(newPath);
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
    if (e.key === 'Enter') {
      setActivePath([index]);
    }
  };

  useEffect(() => {
    if (activePath.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activePath]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  const columnsToRender = useMemo(() => {
    const columns: NavLink[][] = [];
    if (activePath.length > 0) {
      const mainIndex = activePath[0];
      const mainLink = navLinks[mainIndex];
      if (mainLink?.children) {
        columns.push(mainLink.children);
      }
      let currentChildren = mainLink?.children;
      for (let i = 1; i < activePath.length; i++) {
        const childIndex = activePath[i];
        const nextChildren = currentChildren?.[childIndex]?.children;
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

  // ==============================================================================
  // STEG 3: Använd den nya `isFolder`-flaggan för en 100% pålitlig kontroll.
  // ==============================================================================
  const shouldExpand =
    activePath.length > 1 &&
    (navLinks[activePath[0]]?.children ?? [])[activePath[1]]?.isFolder === true;

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
            <Link href={link.href} onClick={handleClick}>
              <span
                className={`pb-0.5 ${
                  activePath.length === 0 && isActivePath(link.href)
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
            {link.isFolder && ( // Använd isFolder här också för tydlighetens skull
              <span
                onKeyDown={(e) => handleKeyOpen(e, index)}
                tabIndex={0}
                className='inline-flex w-3 justify-center items-center focus:text-black text-white cursor-default'
              >
                ˅
              </span>
            )}
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
                        // Använd den pålitliga flaggan här
                        const isFolder = item.isFolder;
                        const isActive =
                          activePath[columnIndex + 1] === itemIndex;

                        return (
                          <li
                            key={item.title}
                            onMouseEnter={() =>
                              handleSubMenuHover(columnIndex, itemIndex)
                            }
                          >
                            {isFolder ? (
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
                                href={item.href}
                                onClick={handleClick}
                                className={`transition focus:border-black outline-none block text-sm font-medium border-b border-transparent hover:border-b hover:border-black w-fit ${
                                  columnsToRender.length > columnIndex + 1
                                    ? 'opacity-50'
                                    : ''
                                  } ${
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
