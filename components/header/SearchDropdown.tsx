'use client';

import {useNavigatedHistory} from '@/context/NavigatedHistoryProvider';
import {AnimatePresence} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {MotionDropdown, MotionOverlay} from '../shared/AnimatedDropdown';

import {Button} from '@/components/shared/button';
import {useMediaQuery} from '@/hooks/useMediaQuery';

const popularSearches = ['T-shirts', 'Overshirt', 'Jackor', 'Byxor', 'Toppar'];

type SearchDropdownProps = {
  isSearchExpanded: boolean;
  setIsSearchExpanded: (isExpanded: boolean) => void;
};

export default function SearchDropdown({
  isSearchExpanded,
  setIsSearchExpanded,
}: SearchDropdownProps) {
  const {
    navigatedProducts,
    searchHistory,
    handleSaveSearch,
    handleRemoveAllSearches,
  } = useNavigatedHistory();

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  /*   const displayedSearches = isDesktop
    ? searchHistory.slice(0, 7)
    : searchHistory; */
  const displayedProducts = isDesktop
    ? navigatedProducts.slice(0, 4)
    : navigatedProducts;

  return (
    <AnimatePresence>
      {isSearchExpanded && (
        <>
          <MotionDropdown
            key='top-menu'
            position='top'
            className='overflow-y-auto pb-20 pt-8 lg:pt-8 h-full lg:h-auto  lg:min-h-64 bg-white'
          >
            <div
              className={`overflow-y-auto px-5 lg:px-8 flex flex-col lg:flex-row ${
                navigatedProducts.length > 0 ? 'gap-10' : 'gap-0 lg:gap-10'
              }`}
            >
              {/* Placeholder for search with popular searches */}
              {!searchHistory.length && (
                <div className=' w-full lg:max-w-80 '>
                  <h2 className='text-sm  uppercase mb-5'>
                    Andra har sökt efter
                  </h2>
                  <ul className='flex flex-wrap gap-3  '>
                    {popularSearches.map((search, index) => (
                      <li key={index}>
                        <Link
                          href={`/search?q=${encodeURIComponent(search)}`}
                          className='border flex border-gray-200 px-4 py-2     rounded-full bg-gray-50 text-xs  hover:border-black transition-colors duration-200  max-w-full'
                          onClick={() => {
                            handleSaveSearch(search);
                            setIsSearchExpanded(false);
                          }}
                        >
                          {search}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {searchHistory.length > 0 && (
                <div className='overflow-y-auto w-full lg:max-w-80 '>
                  <>
                    <div className='flex justify-between mb-5'>
                      <h2 className='text-sm    uppercase '>
                        Tidigare sökningar
                      </h2>
                      <Button
                        variant='link'
                        className='text-xs underline hover:text-gray-500 m-0 py-0 h-auto px-3'
                        onClick={() => handleRemoveAllSearches()}
                      >
                        Radera allt
                      </Button>
                    </div>

                    <ul className='flex flex-wrap gap-3  '>
                      {searchHistory.map((term, index) => (
                        <li
                          key={index}
                          className=' overflow-hidden flex items-center  relative'
                        >
                          <Link
                            href={`/search?q=${encodeURIComponent(term)}`}
                            onClick={() => {
                              handleSaveSearch(term);
                              setIsSearchExpanded(false);
                            }}
                            className='border  border-gray-200 px-4 py-2     rounded-full bg-gray-50 text-xs  hover:border-black transition-colors duration-200 overflow-hidden text-ellipsis  max-w-full'
                          >
                            {term}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                </div>
              )}

              {navigatedProducts.length > 0 && (
                <>
                  <div className='flex-1 '>
                    <h2 className='text-sm  uppercase mb-4'>Nyligen besökta</h2>
                    <div className='grid  grid-cols-3 sm:grid-cols-5  lg:grid-cols-4 2xl:grid-cols-6  gap-0.5 lg:gap-1 overflow-y-auto'>
                      {displayedProducts.map((product) => (
                        <div
                          key={product.slug}
                          className='relative aspect-[7/9]  w-full h-full '
                        >
                          <Link
                            href={`/${product.slug}`}
                            className='group'
                            tabIndex={0}
                            onClick={() => setIsSearchExpanded(false)}
                          >
                            <Image
                              src={product.image}
                              alt={product.slug}
                              quality={90}
                              tabIndex={-1}
                              fill
                              className='object-cover border border-gray-200  hover:border-black transition-colors duration-200 active:border-black group-focus:border-black'
                            />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </MotionDropdown>

          <MotionOverlay
            key='search-overlay'
            className='top-14'
            withDelay={true}
            onClick={() => {
              setIsSearchExpanded(false);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
