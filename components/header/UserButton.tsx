'use client';

import Link from 'next/link';

import {User, Loader2, ArrowRight} from 'lucide-react';
import {useAuth} from '@/hooks/useAuth';
import {useEffect, useState, useRef} from 'react';

// import SpinningLogo from '../shared/SpinningLogo';
import {motion} from 'framer-motion';
import {AnimatePresence} from 'framer-motion';
import {MotionCloseX} from '../shared/AnimatedSidebar';
import {useSaveCurrentUrl} from '@/hooks/useLoginRedirect';
import {useRouter} from 'next/navigation';
import {signOut} from 'next-auth/react';

function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    setTimeout(async () => {
      await signOut();
      setIsPending(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleLogout}
      type='button'
      disabled={isPending}
      className='flex items-center w-full  px-4 py-2 lg:py-2.5 text-sm  disabled:opacity-70 cursor-pointer'
    >
      {isPending ? (
        <>
          <span className='flex w-full justify-between group relative items-center gap-2 text-red-800'>
            Loggar ut...
            <Loader2 size={14} className='animate-spin' />
          </span>
        </>
      ) : (
        <>
          <span className='flex w-full hover:text-red-800 font-medium justify-between group relative items-center gap-2 text-gray-700'>
            Logga ut
            <ArrowRight
              size={12}
              strokeWidth={1.5}
              className='group-hover:translate-x-1  transition-transform duration-300'
            />
          </span>
        </>
      )}
    </button>
  );
}

const UserButton = ({
  setIsSearchExpanded,
  isSearchExpanded,
}: {
  setIsSearchExpanded: (value: boolean) => void;
  isSearchExpanded: boolean;
}) => {
  const [mounted, setMounted] = useState(false);
  const {user, loading, role} = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const saveCurrentUrl = useSaveCurrentUrl();
  const router = useRouter();
  const handleLogin = () => {
    saveCurrentUrl();
    router.push('/sign-in');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading || !mounted) {
    return (
      <span className='flex items-center justify-center'>
        {/* <SpinningLogo width='30' height='25' /> */}
        <User size={24} strokeWidth={1} className='lg:hidden' />
        <span className='hidden lg:block  text-sm font-medium uppercase'>
          Logga in
        </span>
      </span>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => {
          if (isSearchExpanded) {
            setIsSearchExpanded(false);
          }
          handleLogin();
        }}
      >
        <User size={24} strokeWidth={1} className='lg:hidden' />
        <span className='hidden lg:block text-sm font-medium uppercase border-b border-transparent hover:border-black transition cursor-pointer text-nowrap'>
          Logga in
        </span>
      </button>
    );
  }

  let firstAndLastInitial = '';
  if (user.name) {
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      firstAndLastInitial =
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    } else {
      firstAndLastInitial = nameParts[0].charAt(0).toUpperCase();
    }
  } else {
    firstAndLastInitial = user.email?.charAt(0).toUpperCase() ?? 'U';
  }
  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => {
          if (isSearchExpanded) {
            setIsSearchExpanded(false);
          }
          setIsOpen(!isOpen);
        }}
        className='flex items-center  cursor-pointer  relative'
      >
        {/* Mobile user button */}
        <div
          className={`h-6 w-6 rounded-full uppercase  border  bg-white flex items-center justify-center text-[11px]  font-medium lg:hidden ${
            role === 1
              ? 'text-red-800 border-red-800'
              : 'text-gray-700 border-black/80'
          }`}
        >
          {firstAndLastInitial}
        </div>
        {/* Desktop user button */}
        <span
          className={`hidden lg:block text-sm font-medium uppercase border-b border-transparent transition text-nowrap ${
            role === 1
              ? 'text-red-800 hover:border-red-800'
              : ' hover:border-black '
          }`}
        >
          MITT KONTO
        </span>
      </button>
      {/* User dropdown when logged in*/}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute top-10 lg:top-9.5  -right-5 lg:-right-25 w-64 lg:w-[300px] bg-white  rounded-xs shadow-lg py-1 z-20 border  border-gray-300
            
            before:content-[''] before:absolute before:bottom-full before:right-6 lg:before:left-1/2 before:w-0 before:h-0 before:border-[8px] before:border-transparent before:border-b-gray-400/80

            after:content-[''] after:absolute after:bottom-full after:right-6 lg:after:left-1/2 after:w-0 after:h-0 after:border-[8px] after:border-transparent after:border-b-white after:-mb-px
            `}
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.1}}
          >
            <div className='px-4 py-2.5 lg:py-2.5.5 relative border-b border-gray-300'>
              <h5 className='text-base lg:text-lg flex items-center  font-medium text-gray-900 truncate leading-tight '>
                {user.name || 'Användare'}{' '}
                {role === 1 && (
                  <span className='text-xs underline underline-offset-2 text-red-800 font-semibold  ml-2'>
                    ADMIN
                  </span>
                )}
                <span className='absolute right-1 '>
                  <MotionCloseX
                    className='px-3.5 py-1'
                    size={12}
                    strokeWidth={2}
                    onClick={() => setIsOpen(false)}
                  />
                </span>
              </h5>

              <span className='text-sm font-medium  text-gray-600'>
                {user.email}
              </span>
            </div>
            {role === 1 && (
              <Link
                href='/admin'
                className='flex items-center px-4  hover:text-gray-700 py-2 lg:py-2.5 text-sm   border-b  border-gray-200'
                onClick={() => setIsOpen(false)}
              >
                <span className='flex w-full font-medium  justify-between group relative items-center gap-2 '>
                  <span className='font-bold '>Admin Dashboard</span>
                  <ArrowRight
                    size={12}
                    strokeWidth={1.5}
                    className='group-hover:translate-x-1  transition-transform duration-300'
                  />
                </span>
              </Link>
            )}
            <Link
              href='/profile/orders'
              className='flex items-center px-4 py-2 lg:py-2.5 text-sm  text-gray-700  border-b  border-gray-200'
              onClick={() => setIsOpen(false)}
            >
              <span className='flex w-full font-medium hover:text-black justify-between group relative items-center gap-2 '>
                Mina beställningar
                <ArrowRight
                  size={12}
                  strokeWidth={1.5}
                  className='group-hover:translate-x-1  transition-transform duration-300'
                />
              </span>
            </Link>

            <LogoutButton />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserButton;
