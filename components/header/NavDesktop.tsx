'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {NavLink} from './NavLinks';
import {AnimatePresence} from 'framer-motion';
import {
  MotionCloseX,
  MotionDropdown,
  MotionOverlay,
} from '@/components/shared/AnimatedDropdown';

interface DesktopNavProps {
  navLinks: NavLink[];
}

export default function DesktopNav({navLinks}: DesktopNavProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // candidateRef lagrar vilket index för att trigga hover
  const candidateRef = useRef<number | null>(null);
  const isActivePath = (href: string) => {
    if (href === '/' && pathname === '/') {
      return true;
    }
    return href !== '/' && pathname.startsWith(href);
  };

  const closeDropdown = () => {
    setHoveredIndex(null);
    candidateRef.current = null;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleKeyOpen = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    index: number
  ) => {
    if (e.key === 'Enter') {
      setHoveredIndex(index);
    }
  };

  // När musen går in på en main-länk
  const handleHover = (index: number): void => {
    candidateRef.current = index;
    // Om dropdownen inte redan är öppen, starta timeouten
    if (hoveredIndex === null) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        // Kontrollera att användaren fortfarande är kvar på samma länk
        if (candidateRef.current === index) {
          setHoveredIndex(index);
        }
      }, 500);
    } else {
      setHoveredIndex(index);
    }
  };

  // När musen lämnar main-länken
  const handleMouseLeave = () => {
    // Endast rensa timeout och candidate om dropdownen inte redan är öppen
    if (hoveredIndex === null) {
      candidateRef.current = null;
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    }
  };

  const handleClick = () => {
    setTimeout(() => closeDropdown(), 300);
  };

  useEffect(() => {
    if (hoveredIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  return (
    <nav className='uppercase'>
      {/* Huvudnavigering */}
      <ul className='flex items-center gap-2 justify-center relative z-50 '>
        {navLinks.map((link, index) => (
          <li
            key={link.title}
            onMouseEnter={() => handleHover(index)}
            onMouseLeave={handleMouseLeave}
            className='text-sm font-semibold  cursor-pointer font-syne '
          >
            <Link href={link.href} onClick={handleClick}>
              <span
                className={` pb-0.5 ${
                  hoveredIndex === null && isActivePath(link.href)
                    ? 'text-black border-b border-black '
                    : hoveredIndex === index
                      ? 'text-black border-b border-black hover:border-black'
                      : hoveredIndex !== null
                        ? 'text-gray-500'
                        : ''
                }`}
              >
                {link.title}
              </span>
            </Link>

            {/* Keyboard navigation for dropdown */}
            <span
              key={link.title}
              onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) =>
                handleKeyOpen(e, index)
              }
              tabIndex={0}
              className='hidden md:inline-flex w-3 justify-center items-center focus:text-black text-white cursor-default'
            >
              ˅
            </span>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {hoveredIndex !== null && (
          <>
            <MotionDropdown
              position='left'
              key='desktop-dropdown'
              onMouseLeave={closeDropdown}
              className='pt-19 pl-8 min-w-[430px] '
            >
              <div className='absolute top-1 right-1'>
                <MotionCloseX
                  withTranslate={true}
                  size={14}
                  strokeWidth={1.5}
                  className='p-5'
                  onClick={closeDropdown}
                />
              </div>
              <ul className='flex flex-col overflow-y-auto w-full h-full  space-y-6 '>
                {navLinks[hoveredIndex]?.subLinks?.map((subLink) => (
                  <li key={subLink.title}>
                    <Link
                      key={subLink.title}
                      href={subLink.href}
                      onClick={closeDropdown}
                      className={`transition focus:border-black outline-none block not-first:pt-2 text-sm  border-b border-transparent hover:border-b hover:border-black w-fit ${
                        subLink.title === 'ERBJUDANDEN'
                          ? 'text-red-600 hover:border-red-600 focus:border-red-600'
                          : ''
                      } `}
                    >
                      {subLink.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </MotionDropdown>

            <MotionOverlay key='desktop-overlay' />
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
