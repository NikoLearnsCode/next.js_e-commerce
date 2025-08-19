'use client';

import DesktopNav from './NavDesktop';
import MobileNav from './NavMobile';

export interface SubLink {
  title: string;
  href: string;
}

export interface NavLink {
  title: string;
  href: string;
  subLinks?: SubLink[];
}

const navLinks: NavLink[] = [
  {
    title: 'Dam',
    href: '/c/dam',
    subLinks: [
      {title: 'KLÄNNINGAR', href: '/c/dam/klanningar'},
      {title: 'BYXOR', href: '/c/dam/byxor'},
      {title: 'JACKOR', href: '/c/dam/jackor'},
      {title: 'TOPPAR', href: '/c/dam/Toppar'},

      {title: 'ERBJUDANDEN', href: '/c/dam'},
    ],
  },
  {
    title: 'Herr',
    href: '/c/herr',
    subLinks: [
      {title: 'OVERSHIRT', href: '/c/herr/overshirt'},
      {title: 'BYXOR', href: '/c/herr/byxor'},
      {title: 'JACKOR', href: '/c/herr/jackor'},
      {title: 'T-SHIRTS', href: '/c/herr/t-shirts'},
      {title: 'ERBJUDANDEN', href: '/c/herr'},
    ],
  },

  {
    title: 'Hem',
    href: '/',
    subLinks: [
      {title: 'Kontakta oss', href: '/kontakt'},
      {title: 'Returer', href: '/retur'},
      {title: 'Frakt', href: '/frakt'},
    ],
  },
];

export default function Navigation() {
  return (
    <>
      <div className='md:hidden'>
        <MobileNav navLinks={navLinks} />
      </div>
      <div className='hidden md:block'>
        <DesktopNav navLinks={navLinks} />
      </div>
    </>
  );
}
