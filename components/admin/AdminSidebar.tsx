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
    className={`h-7 w-3.5 shrink-0  font-semibold   mb-[2.25px] flex items-center justify-center   text-base ${isActive ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}
  >
    {letter}
  </div>
);

const navigation = [
  {name: 'ashboard', href: '/admin', letter: 'D'},
  {name: 'rodukter', href: '/admin/products', letter: 'P'},
  {name: 'ategorier', href: '/admin/categories', letter: 'K'},
  {
    name: 'eställningar',
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
      className='fixed inset-y-0 bg-white left-0 z-20 border-r border-gray-100 '
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
        <div className='flex h-18 shrink-0 items-center justify-end'>
          <button
            onClick={toggleSidebar}
            className=' px-3 py-6 cursor-pointer rounded-md relative flex flex-col justify-center items-center gap-1'
          >
            <motion.span
              className={`inline-flex border-t-[1.5px] w-5  ${isCollapsed ? 'border-gray-600' : 'border-gray-400'}`}
              animate={{
                rotate: isCollapsed ? 0 : 45,
                y: isCollapsed ? 0 : 2.5,
              }}
              transition={{duration: 0.2}}
            />
            <motion.span
              className={`inline-flex border-t-[1.5px] w-5  ${isCollapsed ? 'border-gray-600' : 'border-gray-400 '}`}
              animate={{
                rotate: isCollapsed ? 0 : -45,
                y: isCollapsed ? 0 : -2.5,
              }}
              transition={{duration: 0.2}}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex flex-1 flex-col px-2.25 py-4'>
          <ul role='list' className='flex flex-1 flex-col '>
            <li>
              <ul role='list' className='space-y-4 '>
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex font-medium border hover:border-gray-100 uppercase text-[11px] items-center rounded-[6px]  px-2 leading-6  transition-all duration-200
                          ${isCollapsed ? '' : ' hover:bg-gray-50'}
                           ${
                             isActive
                               ? 'bg-gray-50 border border-gray-100  text-black'
                               : 'bg-white border-transparent hover:bg-gray-50 text-gray-600 hover:text-black'
                           }


                        `}
                        title={
                          isCollapsed ? item.letter + item.name : undefined
                        }
                      >
                        <LetterIcon letter={item.letter} isActive={isActive} />
                        <motion.span
                          animate={{
                            opacity: isCollapsed ? 0 : 1,
                            width: isCollapsed ? 0 : 'auto',
                          }}
                          transition={{duration: 0.5}}
                          className='  whitespace-nowrap flex items-center '
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
              group flex items-center uppercase rounded-[10px] px-1.5 py-2  leading-6 font-semibold text-[12px] hover:text-black text-gray-700  transition-all duration-200
              ${isCollapsed ? '' : 'gap-x-3'}
            `}
            title={isCollapsed ? 'Tillbaka till butik' : undefined}
          >
            <svg
              className='h-6 w-6 mb-1 shrink-0 text-black'
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
              transition={{duration: 0.5}}
              className='  whitespace-nowrap flex items-center '
            >
              {!isCollapsed && (
                <div className='text-base flex group items-center justify-center gap-[1px]'>
                  <span className='text-[16px] mb-[2px]  text-gray-600 group-hover:text-black'>B</span>

                  <span className='text-[11px]  text-gray-600 group-hover:text-black'>
                    ack to store{' '}
                  </span>
                </div>
              )}
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
