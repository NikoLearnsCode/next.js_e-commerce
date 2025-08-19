'use client';

import Link from 'next/link';

import {User, Loader2, ArrowRight} from 'lucide-react';
import {useAuth} from '@/context/AuthProvider';
import {useEffect, useState, useRef, useTransition} from 'react';
import {signOutAction} from '@/actions/auth';
// import SpinningLogo from '../shared/SpinningLogo';
import {motion} from 'framer-motion';
import {AnimatePresence} from 'framer-motion';
import {MotionCloseX} from '../shared/AnimatedDropdown';
import {useSaveCurrentUrl} from '@/hooks/useLoginRedirect';
import {useRouter} from 'next/navigation';

function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <button
      onClick={handleSignOut}
      type='button'
      disabled={isPending}
      className='flex items-center w-full  px-4 py-2 text-sm  disabled:opacity-70 cursor-pointer'
    >
      {isPending ? (
        <>
          <span className='flex w-full justify-between group relative items-center gap-2 text-red-700'>
            Loggar ut...
            <Loader2 size={14} className='animate-spin' />
          </span>
        </>
      ) : (
        <>
          <span className='flex w-full hover:text-red-700 font-medium justify-between group relative items-center gap-2 text-gray-700'>
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
  const {user, loading, refreshUser} = useAuth();
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

  // Uppdatera användarinformation när komponenten monteras
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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
        <User size={24} strokeWidth={1} className='md:hidden' />
        <span className='hidden md:block  text-sm font-medium uppercase'>
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
        <User size={24} strokeWidth={1} className='md:hidden' />
        <span className='hidden md:block text-sm font-medium uppercase border-b border-transparent hover:border-black transition cursor-pointer text-nowrap'>
          Logga in
        </span>
      </button>
    );
  }

  let firstAndLastInitial = '';

  if (user.user_metadata.first_name && user.user_metadata.last_name) {
    firstAndLastInitial =
      user.user_metadata.first_name?.charAt(0).toUpperCase() +
      user.user_metadata.last_name?.charAt(0).toUpperCase();
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
        <div className='h-6 w-6 rounded-full uppercase  border border-black/80 bg-white flex items-center justify-center text-[11px]  font-medium md:hidden'>
          {firstAndLastInitial}
        </div>
        <span className='hidden md:block text-sm font-medium uppercase border-b border-transparent hover:border-black transition text-nowrap '>
          MITT KONTO
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute top-10 md:top-9.5  -right-5 md:-right-25 w-64 md:w-[300px] bg-white  rounded-xs shadow-lg py-1 z-20 border  border-gray-300
            
            before:content-[''] before:absolute before:bottom-full before:right-6 md:before:left-1/2 before:w-0 before:h-0 before:border-[8px] before:border-transparent before:border-b-gray-400/80

            after:content-[''] after:absolute after:bottom-full after:right-6 md:after:left-1/2 after:w-0 after:h-0 after:border-[8px] after:border-transparent after:border-b-white after:-mb-px
            `}
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.1}}
          >
            <div className='px-4 py-2.5 relative border-b border-gray-300'>
              <h5 className='text-base md:text-lg flex  justify-between font-medium text-gray-900 truncate leading-tight '>
                {user.user_metadata.full_name}{' '}
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

            <Link
              href='/profile'
              className='flex items-center px-4 py-2 text-sm  text-gray-700  border-b  border-gray-200'
              onClick={() => setIsOpen(false)}
            >
              <span className='flex w-full font-medium hover:text-black justify-between group relative items-center gap-2 '>
                Mitt konto
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
