'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {NavLink} from './NavLinks';
import {AnimatePresence, motion} from 'framer-motion';
import {MotionCloseX, MotionOverlay} from '@/components/shared/AnimatedSidebar';

interface DesktopNavProps {
  navLinks: NavLink[];
}

export default function DesktopNav({navLinks}: DesktopNavProps) {
  // State för att hålla koll på vilken main-kategori som hovras (t.ex. "HERR")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // State för att hålla koll på vilken sub-kategori som hovras (t.ex. "PLAGG")
  const [hoveredSubIndex, setHoveredSubIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const candidateRef = useRef<number | null>(null);

  // Säkra att navLinks inte är undefined innan du använder det
  if (!navLinks || navLinks.length === 0) {
    return null; // Renderar inget om det inte finns några länkar
  }

  // Kontrollerar om en länk är aktiv baserat på nuvarande sökväg
  const isActivePath = (href: string) => {
    if (href === '/' && pathname === '/') {
      return true;
    }
    return href !== '/' && pathname.startsWith(href);
  };

  // Stänger alla öppna dropdowns och återställer state
  const closeDropdown = () => {
    setHoveredIndex(null);
    setHoveredSubIndex(null);
    candidateRef.current = null;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Öppnar dropdown med Enter-tangent
  const handleKeyOpen = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    index: number
  ) => {
    if (e.key === 'Enter') {
      setHoveredIndex(index);
    }
  };

  // Hanterar hover på main-kategorier med delay för bättre UX
  const handleHover = (index: number): void => {
    candidateRef.current = index;
    if (hoveredIndex === null) {
      // Delay endast för första öppningen
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        if (candidateRef.current === index) {
          setHoveredIndex(index);
        }
      }, 300);
    } else {
      // Direkt byte mellan kategorier
      setHoveredIndex(index);
    }
  };

  // Avbryter pending hover om musen lämnar innan delay
  const handleMouseLeave = () => {
    if (hoveredIndex === null) {
      candidateRef.current = null;
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    }
  };

  // Stänger dropdown efter länkklick
  const handleClick = () => {
    setTimeout(() => closeDropdown(), 300);
  };

  // Sätter vilket sub-index som hovras för subsub-expansion
  const handleSubHover = (subIndex: number) => {
    setHoveredSubIndex(subIndex);
  };

  // Förhindrar scrollning när dropdown är öppen
  useEffect(() => {
    if (hoveredIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [hoveredIndex]);

  // Stänger dropdown med Escape-tangent
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
      {/* Main navigation - HERR, DAM, HEM etc */}
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
                  // Visar active state när ingen dropdown är öppen
                  hoveredIndex === null && isActivePath(link.href)
                    ? 'text-black border-b delay-300 border-black '
                    : // Visar hovered state när denna kategori hovras
                      hoveredIndex === index
                      ? 'text-black border-b border-black hover:border-black'
                      : // Dimmar andra kategorier när en dropdown är öppen
                        hoveredIndex !== null
                        ? 'text-gray-500'
                        : ''
                }`}
              >
                {link.title}
              </span>
            </Link>

            {/* Dropdown-pil, endast synlig på desktop */}
            <span
              key={link.title}
              onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) =>
                handleKeyOpen(e, index)
              }
              tabIndex={0}
              className='hidden lg:inline-flex w-3 justify-center items-center focus:text-black text-white cursor-default'
            >
              ˅
            </span>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {hoveredIndex !== null && (
          <>
            {/* Huvuddropdown med smooth slide-in från höger + bredd-expansion */}
            <motion.div
              key='desktop-dropdown'
              onMouseLeave={closeDropdown}
              className='fixed left-0 top-0 h-full bg-white z-40 shadow-md pt-19 pl-8'
              initial={{
                clipPath: 'inset(0% 100% 0% 0%)', // Börjar helt dold (klippt från höger)
                opacity: 1,
                // minWidth: '350px',
              }}
              animate={{
                clipPath: 'inset(0% 0% 0% 0%)', // Slides in från höger
                opacity: 1,
                minWidth: hoveredSubIndex !== null ? '450px' : '330px',

              }}
              exit={{
                clipPath: 'inset(0% 100% 0% 0%)', // Slides ut till höger
                opacity: 1,
                // width: hoveredSubIndex !== null ? '450px' : '330px',
              }}
              transition={{
                type: 'tween',
                ease: 'easeOut',
                duration: 0.3,
                delay: 0.1,
              }}
            >
              {/* Stäng-knapp (X) */}
              <div className='absolute top-1 right-1'>
                <MotionCloseX
                  size={14}
                  strokeWidth={1.5}
                  className='p-5'
                  onClick={closeDropdown}
                />
              </div>

              <div className='flex h-full'>
                {/* Vänster kolumn: Sub-länkar (PLAGG, YTTERPLAGG, NYHETER) */}
                <div className='min-w-[180px] pr-8'>
                  <ul className='flex flex-col overflow-y-auto text-nowrap space-y-6'>
                    {navLinks[hoveredIndex]?.subLinks?.map(
                      (subLink, subIndex) => (
                        <li key={subLink.title}>
                          {/* Sub-länkar med subSubLinks (t.ex. PLAGG) */}
                          {subLink.subSubLinks &&
                          subLink.subSubLinks.length > 0 ? (
                            <span
                              onMouseEnter={() => handleSubHover(subIndex)}
                              className={`cursor-pointer transition focus:border-black outline-none block not-first:pt-2 text-sm font-medium border-b border-transparent hover:border-b hover:border-black w-fit  ${
                                // Active state: behåller border när subsub är öppen
                                hoveredSubIndex === subIndex
                                  ? 'text-black !border-b !border-black'
                                  : // Dimmar ej aktiva när subsub är öppen
                                    hoveredSubIndex !== null
                                    ? 'opacity-60'
                                    : ''
                              }`}
                            >
                              {subLink.title}
                            </span>
                          ) : (
                            /* Sub-länkar utan subSubLinks (t.ex. NYHETER) */
                            <span
                              onMouseEnter={() => setHoveredSubIndex(null)} // Stänger subsub
                              className={`block not-first:pt-2 transition ${
                                hoveredSubIndex !== null ? 'opacity-60' : ''
                              }`}
                            >
                              <Link
                                href={subLink.href}
                                onClick={handleClick}
                                className={`transition focus:border-black outline-none block text-sm font-medium border-b border-transparent hover:border-b hover:border-black w-fit ${
                                  // Special styling för "Nyheter"
                                  subLink.title === 'Nyheter'
                                    ? 'text-red-800 hover:border-red-800 focus:border-red-800'
                                    : ''
                                }`}
                              >
                                {subLink.title}
                              </Link>
                            </span>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Höger kolumn: SubSub-länkar (T-SHIRTS, JEANS, etc) */}
                <AnimatePresence>
                  {hoveredSubIndex !== null &&
                    hoveredIndex !== null &&
                    navLinks[hoveredIndex]?.subLinks?.[hoveredSubIndex]
                      ?.subSubLinks &&
                    navLinks[hoveredIndex]?.subLinks?.[hoveredSubIndex]
                      ?.subSubLinks!.length > 0 && (
                      <motion.div
                        key='subsub-content'
                        initial={{opacity: 0}} // Börjar transparent
                        animate={{opacity: 1}} // Fades in
                        exit={{opacity: 0}} // Fades ut
                        transition={{duration: 0.3, delay: 0.1}} // Kort delay så huvudanimationen hinner först
                      >
                        <ul className='flex flex-col space-y-6'>
                          {/* Renderar alla subsub-länkar för den hovrade sub-kategorin */}
                          {navLinks[hoveredIndex]?.subLinks?.[
                            hoveredSubIndex
                          ]?.subSubLinks?.map((subSubLink) => (
                            <li key={subSubLink.title}>
                              <Link
                                href={subSubLink.href}
                                onClick={closeDropdown}
                                className='transition focus:border-black outline-none block text-sm font-medium border-b border-transparent hover:border-b hover:border-black w-fit'
                              >
                                {subSubLink.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Overlay som dimmar bakgrunden när dropdown är öppen */}
            <MotionOverlay key='desktop-overlay' withDelay={true} />
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
