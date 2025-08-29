'use client';

import {useEffect, useState} from 'react';
import SearchBar from './SearchBar';
import UserButton from './UserButton';
import HeaderFavoritesButton from './FavoritesButton';
import HeaderCartDropdown from '@/components/cart/HeaderCartDropdown';
import SearchDropdown from './SearchDropdown';
import {NavLink} from '@/lib/types/category-types';
import NavLinks from './NavLinks';
import Logo from '../shared/Logo';

export default function HeaderInteractive({navLinks}: {navLinks: NavLink[]}) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isSearchExpanded ? 'hidden' : 'auto';
  }, [isSearchExpanded]);

  return (
    <>
      <div className='fixed w-full top-0 z-30 left-0 right-0 text-black bg-white flex justify-between items-center px-4 sm:px-8 h-14 gap-8'>
        {!isSearchExpanded && (
          <div className='flex gap-4 lg:gap-0 items-center'>
            <NavLinks navLinks={navLinks} />
            <div className='lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2'>
              <Logo />
            </div>
          </div>
        )}

        <div
          className={`flex items-center justify-end gap-4 sm:gap-5 ${
            isSearchExpanded ? 'flex-grow' : ''
          }`}
        >
          <SearchBar
            isExpanded={isSearchExpanded}
            setIsExpanded={setIsSearchExpanded}
          />

          <UserButton
            setIsSearchExpanded={setIsSearchExpanded}
            isSearchExpanded={isSearchExpanded}
          />
          <HeaderFavoritesButton
            setIsSearchExpanded={setIsSearchExpanded}
            isSearchExpanded={isSearchExpanded}
          />
          <HeaderCartDropdown
            setIsSearchExpanded={setIsSearchExpanded}
            isSearchExpanded={isSearchExpanded}
          />
        </div>
      </div>

      <SearchDropdown
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
      />
    </>
  );
}
