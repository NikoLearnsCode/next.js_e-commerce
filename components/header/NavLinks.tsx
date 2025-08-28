'use client';

import DesktopNav from './NavDesktop';
import MobileNav from './NavMobile';

export interface SubLink {
  title: string;
  href: string;
  displayOrder: number;
}

export interface NavLink {
  title: string;
  href: string;
  subLinks?: SubLink[];
  subSubLinks?: SubLink[];
  displayOrder: number;
}

export default function NavLinks({navLinks}: {navLinks: NavLink[]}) {
  return (
    <>
      <div className='lg:hidden'>
        <MobileNav navLinks={navLinks} />
      </div>
      <div className='hidden lg:block'>
        <DesktopNav navLinks={navLinks} />
      </div>
    </>
  );
}
