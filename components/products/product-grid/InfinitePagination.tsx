'use client';
import {useEffect, useRef} from 'react';
import {useInView} from 'react-intersection-observer';
import {useSearchParams} from 'next/navigation';
import type {Product} from '@/lib/types/db';
import ProductGrid from '@/components/products/product-grid/ProductGrid';
import {useInfiniteProducts} from '@/hooks/useInfiniteProducts';
// import {useScrollRestoration} from '@/hooks/useScrollRestoration';
import SpinningLogo from '@/components/shared/ui/SpinningLogo';

type InfiniteScrollProductsProps = {
  initialProducts: Product[];
  initialHasMore: boolean;
  className?: string;
  gender?: string;
  category?: string;
};

export default function InfiniteScrollProducts({
  initialProducts,
  initialHasMore,
  className,
  gender,
  category,
}: InfiniteScrollProductsProps) {
  const searchParams = useSearchParams();
  // const {restoreScrollPosition} = useScrollRestoration();
  // const hasRestoredRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract filter parameters from URL
  const color = searchParams.get('color')?.split(',').filter(Boolean) || [];
  const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const sort = searchParams.get('sort') || undefined; // Let hook handle default

  // React Query infinite scroll hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    // isSuccess,
    isLoading,
  } = useInfiniteProducts({
    category,
    gender,
    color,
    sizes,
    sort,
    initialHasMore,
    initialProducts,
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

  // Get all products from React Query
  const products =
    data?.pages.flatMap((page: {products: Product[]}) => page.products) ?? [];

  // Decide what to display: use React Query data if available and not loading, otherwise SSR data
  const displayProducts =
    !isLoading && products.length > 0 ? products : initialProducts;

  /*   // Reset scroll restoration flag when URL changes (new filters applied)
  useEffect(() => {
    hasRestoredRef.current = false;
  }, [searchParams]);

  // Scroll restoration with simplified logic
  useEffect(() => {
    if (isSuccess && !hasRestoredRef.current && !isLoading) {
      console.log('Restoring scroll position...');
      restoreScrollPosition();
      hasRestoredRef.current = true;
    }
  }, [isSuccess, restoreScrollPosition, isLoading]); */

  // Error state
  if (error) {
    return (
      <div className='text-center py-12 min-h-[calc(100vh-400px)]'>
        <p className='text-red-800 font-semibold italic'>
          Ett fel uppstod:{' '}
          {error instanceof Error ? error.message : 'Okänt fel'}
        </p>
      </div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className='flex items-center justify-center text-center py-12 min-h-[calc(100vh-400px)]'>
        <p className='text-gray-600 text-base'>Inga produkter att visa.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <ProductGrid products={displayProducts} />

      {/* Loading indicator and intersection trigger */}
      {hasNextPage && initialHasMore && (
        <div ref={ref} className='flex justify-center opacity-70 py-8'>
          {isFetchingNextPage ? (
            <SpinningLogo width='45' height='37' />
          ) : (
            <div />
          )}
        </div>
      )}

      {/* No more products message */}
      {!hasNextPage && displayProducts.length > 8 && (
        <div className='text-center py-12'>
          <p className='text-gray-600 text-base'>
            Inga fler produkter att visa.
          </p>
        </div>
      )}

      {/* Initial loading state */}
      {isLoading && displayProducts.length === 0 && (
        <div className='flex justify-center py-8 opacity-70'>
          <SpinningLogo width='45' height='37' />
        </div>
      )}
    </div>
  );
}
