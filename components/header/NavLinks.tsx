'use client';

import DesktopNav from './NavDesktop';
import MobileNav from './NavMobile';
import {NavLink} from '@/lib/types/category-types';

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
