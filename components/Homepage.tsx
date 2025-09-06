'use client';

import Image from 'next/image';
import {Link} from '@/components/shared/ui/link';
import {useState, useEffect} from 'react';

export default function Homepage() {
  const [currentView, setCurrentView] = useState<'dam' | 'herr'>('dam');

  const damDesktopImage = '/images/LP.DAM.avif';
  const herrDesktopImage = '/images/LP.HERR.avif';
  const damMobileImage = '/images/LP.DAM.MOBILE.avif';
  const herrMobileImage = '/images/LP.HERR.MOBILE.avif';

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentView((prevView) => (prevView === 'dam' ? 'herr' : 'dam'));
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='relative'>
      <div className='relative min-h-[calc(100vh-56px)]'>
        <div className='sm:hidden absolute w-full h-full'>
          <Image
            src={damMobileImage}
            alt='Landing-Page-Dam-Mobil'
            fill
            priority={true}
            loading='eager'
            sizes='90vw'
            quality={90}
            className={`object-cover  object-top w-full h-full absolute top-0 left-0 transition-opacity duration-500 ${currentView === 'dam' ? 'opacity-100' : 'opacity-0'}`}
          />
          <Image
            src={herrMobileImage}
            alt='Landing-Page-Herr-Mobil'
            fill
            priority={true}
            loading='eager'
            sizes='90vw'
            quality={90}
            className={`object-cover  object-top  w-full h-full absolute top-0 left-0 transition-opacity duration-500 will-change-opacity ${currentView === 'herr' ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        <div className='hidden sm:block w-full h-full absolute '>
          <Image
            src={damDesktopImage}
            alt='Landing-Page-Dam'
            fill
            priority={true}
            loading='eager'
            sizes='90vw'
            quality={90}
            className={`object-cover  w-full h-full absolute top-0 left-0 transition-opacity duration-700 ${
              currentView === 'dam' ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <Image
            src={herrDesktopImage}
            alt='Landing-Page-Herr'
            fill
            loading='lazy'
            sizes='90vw'
            quality={90}
            className={`object-cover   w-full h-full absolute top-0 left-0 transition-opacity duration-700 ${
              currentView === 'herr' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>

      <div className='absolute left-0 top-5/8 w-full px-6'>
        <div className='flex justify-center items-center space-x-5 font-syne uppercase'>
          <Link
            variant='secondaryTwo'
            href='/c/dam'
            className='w-full h-14 sm:w-40 text-sm  font-semibold '
          >
            dam
          </Link>
          <Link
            variant='primaryTwo'
            href='/c/herr'
            className='w-full h-14 sm:w-40 text-sm  font-semibold '
          >
            herr
          </Link>
        </div>
      </div>
    </div>
  );
}
