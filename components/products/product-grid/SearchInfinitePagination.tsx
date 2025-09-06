'use client';

import {useEffect, useRef} from 'react';
import {useInView} from 'react-intersection-observer';
import {Product} from '@/lib/types/db';
import ProductGrid from '@/components/products/product-grid/ProductGrid';
import {useInfiniteProducts} from '@/hooks/useInfiniteProducts';
import SpinningLogo from '@/components/shared/ui/SpinningLogo';

type SearchInfiniteScrollProps = {
  initialProducts: Product[];
  initialHasMore: boolean;
  query: string;
  totalCount?: number;
  className?: string;
};

export default function SearchInfiniteScroll({
  initialProducts,
  initialHasMore,
  query,
  totalCount,
  className,
}: SearchInfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // React Query infinite scroll hook for search
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteProducts({
    query,
    initialProducts,
    initialHasMore,
  });

  // Intersection Observer for loading more products
  const {ref, inView} = useInView({
    threshold: 0.1,
    rootMargin: '0px 0px 40% 0px',
    triggerOnce: false,
  });

  // Load more products when in view
  useEffect(() => {
    if (inView && hasNextPage) {
      console.log('Loading more search results...');
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const products =
    data?.pages.flatMap((page: {products: Product[]}) => page.products) ?? [];

  // Error state
  if (error) {
    return (
      <div className='text-center py-12 min-h-[calc(100vh-400px)]'>
        <p className='text-red-800 text-lg font-medium italic'>
          Ett fel uppstod:{' '}
          {error instanceof Error ? error.message : 'Okänt fel'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='w-full'>
        <h2 className='text-sm md:text-base uppercase font-medium px-4 sm:px-8 pt-2 pb-5'>
          Sökresultat för "{query}"
          {totalCount && <span className='ml-2'>({totalCount})</span>}
        </h2>

        <div ref={containerRef} className={className}>
          <ProductGrid products={products} />
        </div>
      </div>

      <div className='w-full'>
        {/* Loading indicator and intersection trigger */}
        {hasNextPage && (
          <div ref={ref} className='flex justify-center opacity-70 py-8'>
            {isFetchingNextPage ? (
              <SpinningLogo height='40' className=' opacity-30' />
            ) : (
              <div />
            )}
          </div>
        )}

        {/* No more products message */}
        {!hasNextPage && products.length > 8 && !isLoading && (
          <div className='text-center py-12'>
            <p className='text-gray-600 text-base'>
              Inga fler sökresultat att visa
            </p>
          </div>
        )}
      </div>
    </>
  );
}
