'use client';

import React, {useRef, useEffect, useState} from 'react';
import {ArrowLeft, Search} from 'lucide-react';
import {motion} from 'framer-motion';
import {useRouter} from 'next/navigation';
import {MotionCloseX} from '../shared/AnimatedSidebar';
import {useNavigatedHistory} from '@/context/NavigatedHistoryProvider';

export default function SearchBar({
  isExpanded,
  setIsExpanded,
}: {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const {handleSaveSearch} = useNavigatedHistory();

  useEffect(() => {
    if (!isExpanded && searchQuery !== '') {
      setSearchQuery('');
    }
  }, [isExpanded, searchQuery]);

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      handleSaveSearch(trimmedQuery);
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);

      setIsExpanded(false);
      setSearchQuery('');
    }
  };

  return (
    <div
      className={`flex items-center  justify-end ${isExpanded ? 'w-full' : ''}`}
    >
      {isExpanded ? (
        <>
          <form
            key='search-form'
            name='search-form'
            className='flex items-center w-full fixed top-0  right-0 h-16  lg:h-auto z-50 lg:relative bg-white pr-6 lg:px-0'
            onSubmit={handleSubmit}
          >
            <button
              className=' lg:hidden p-4'
              onClick={() => setIsExpanded(false)}
            >
              <ArrowLeft
                size={22}
                strokeWidth={1.25}
                className='text-gray-500'
              />
            </button>
            <input
              maxLength={100}
              ref={inputRef}
              type='text'
              name='search'
              autoFocus={true}
              value={searchQuery}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Return') {
                  handleSubmit(e);
                }
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='SÖK'
              className='w-full py-0.5 lg:py-0 pl-0.5 lg:pr-4 lg:placeholder:text-base placeholder:text-lg bg-white outline-none border-b border-gray-900 '
            />

            <MotionCloseX
              onClick={() => setIsExpanded(false)}
              size={12}
              strokeWidth={2}
              className='px-3 py-2 absolute -right-3 hidden lg:block'
              aria-label='Close search'
            />
          </form>
        </>
      ) : (
        <motion.button
          key='search-button'
          onClick={() => setIsExpanded(true)}
          className=' cursor-pointer'
          aria-label='Search'
        >
          <Search size={24} strokeWidth={1} className='lg:hidden' />
          <span className='hidden lg:block text-sm font-medium uppercase border-b border-transparent hover:border-black transition'>
            Sök
          </span>
        </motion.button>
      )}
    </div>
  );
}
