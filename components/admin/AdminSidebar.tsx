'use client';

import React from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {motion} from 'framer-motion';
import {useAdmin} from '@/context/AdminContextProvider';

// Letter-based icon component
const LetterIcon = ({
  letter,
  isActive,
}: {
  letter: string;
  isActive: boolean;
}) => (
  <div
    className={`h-7 w-7 shrink-0 font-arimo flex items-center justify-center rounded  text-sm ${
      isActive
        ? 'bg-gray-200 text-black'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
    }`}
  >
    {letter}
  </div>
);

const navigation = [
  {name: 'Dashboard', href: '/admin', letter: 'D'},
  {name: 'Produkter', href: '/admin/products', letter: 'P'},
  {name: 'Kategorier', href: '/admin/categories', letter: 'K'},
  {
    name: 'Beställningar',
    href: '/admin/orders',
    letter: 'B',
  },
  /* {name: 'Statistik', href: '/admin/stats', letter: 'S'}, */
  /* {name: 'Inställningar', href: '/admin/settings', letter: 'I'}, */
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const {isCollapsed, toggleSidebar} = useAdmin();

  return (
    <motion.div
      className='fixed inset-y-0 left-0 z-20 border-r  bg-gray-50/80 border-gray-200 '
      animate={{
        width: isCollapsed ? '3.25rem' : '11rem',
      }}
      transition={{
        duration: 0.2,
        ease: 'easeInOut',
      }}
    >
      <div className='flex h-full flex-col'>
        {/* Logo and Toggle */}
        <div className='flex h-16 shrink-0 items-center justify-end'>
          <button
            onClick={toggleSidebar}
            className=' px-3.5 py-6 cursor-pointer rounded-md relative flex flex-col justify-center items-center gap-1'
          >
            <motion.span
              className='inline-flex border-t w-5 border-black'
              animate={{
                rotate: isCollapsed ? 0 : 45,
                y: isCollapsed ? 0 : 2.5,
              }}
              transition={{duration: 0.2}}
            />
            <motion.span
              className='inline-flex border-t w-5 border-black'
              animate={{
                rotate: isCollapsed ? 0 : -45,
                y: isCollapsed ? 0 : -2.5,
              }}
              transition={{duration: 0.2}}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex flex-1 flex-col px-1 pb-4'>
          <ul role='list' className='flex flex-1 flex-col '>
            <li>
              <ul role='list' className='space-y-2 '>
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex  text-gray-800 uppercase text-xs items-center rounded-[10px] p-2 leading-6  transition-all duration-200
                          ${isCollapsed ? '' : 'gap-x-3 hover:bg-gray-100'}
                          ${item.name === 'Beställningar' ? 'font-medium' : 'font-syne font-semibold'}


                        `}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <LetterIcon letter={item.letter} isActive={isActive} />
                        <motion.span
                          animate={{
                            opacity: isCollapsed ? 0 : 1,
                            width: isCollapsed ? 0 : 'auto',
                          }}
                          transition={{duration: 0.2}}
                          className='overflow-hidden whitespace-nowrap'
                        >
                          {!isCollapsed && item.name}
                        </motion.span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Back to store */}
        <div className='px-3 pb-6'>
          <Link
            href='/'
            className={`
              group flex items-center uppercase rounded-[10px] p-1 py-3 font-syne leading-6 font-semibold text-xs text-gray-800 hover:bg-gray-100 transition-all duration-200
              ${isCollapsed ? '' : 'gap-x-3'}
            `}
            title={isCollapsed ? 'Tillbaka till butik' : undefined}
          >
            <svg
              className='h-5 w-5 shrink-0 text-black'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3'
              />
            </svg>
            <motion.span
              animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : 'auto',
              }}
              transition={{duration: 0.2}}
              className='overflow-hidden whitespace-nowrap'
            >
              {!isCollapsed && 'Back to store'}
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
