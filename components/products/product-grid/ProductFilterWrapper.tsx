'use client';

import {useEffect, useState, useMemo} from 'react';
import {useRouter, usePathname, useSearchParams} from 'next/navigation';

import {ProductCard} from '@/lib/types/db';
import Link from 'next/link';
import {ChevronRight} from 'lucide-react';
import FilterBar from '@/components/products/product-grid/FilterBar';
import FilterPanel from '@/components/products/product-grid/FilterPanel';
import InfinitePagination from './InfinitePagination';

interface ProductFilterWrapperProps {
  initialProducts: ProductCard[];
  initialHasMore: boolean;
  gender?: string;
  category?: string;
  genderCategoryTitle?: string;
  metadata?: {
    availableColors: string[];
    availableSizes: string[];
    availableCategories: string[];
  };
  className?: string;
  totalCount?: number;
}

export default function ProductFilterWrapper({
  initialProducts,
  initialHasMore,
  gender,
  category,
  genderCategoryTitle,
  metadata,
  className = '',
  totalCount,
}: ProductFilterWrapperProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string | null>(null);

  useEffect(() => {
    const colorParam = searchParams.get('color');
    const sizeParam = searchParams.get('sizes');
    const sortParam = searchParams.get('sort');

    setSelectedColors(colorParam ? colorParam.split(',') : []);
    setSelectedSizes(sizeParam ? sizeParam.split(',') : []);
    setSortOrder(sortParam);
  }, [searchParams]);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleSort = (newSort: string) => {
    setSortOrder((prev) => (prev === newSort ? null : newSort));
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortOrder(null);
    router.push(pathname);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedColors.length) {
      params.set('color', selectedColors.join(','));
    } else {
      params.delete('color');
    }
    if (selectedSizes.length) {
      params.set('sizes', selectedSizes.join(','));
    } else {
      params.delete('sizes');
    }
    if (sortOrder) {
      params.set('sort', sortOrder);
    } else {
      params.delete('sort');
    }

    const url = params.toString() ? `${pathname}?${params}` : pathname;
    router.push(url);

    setIsFilterOpen(false);
  };

  const hasActiveFilters =
    !!sortOrder || selectedColors.length > 0 || selectedSizes.length > 0;

  const activeFilterCount = [
    !!sortOrder,
    selectedColors.length > 0,
    selectedSizes.length > 0,
  ].filter(Boolean).length;

  const pathParts = pathname.split('/');

  const isGenderPage = pathParts.length === 3 && pathParts[1] === 'c';
  const isCategoryPage = pathParts.length === 4 && pathParts[1] === 'c';
  const currentGender = isGenderPage || isCategoryPage ? pathParts[2] : null;

  // Plockar fram unika kategorier
  const uniqueCategories = useMemo(() => {
    if (!isGenderPage) return [];
    if (metadata?.availableCategories) {
      return metadata.availableCategories;
    }

    const categoriesSet = new Set<string>();
    initialProducts.forEach((p) => p.category && categoriesSet.add(p.category));
    return Array.from(categoriesSet).sort();
  }, [initialProducts, isGenderPage, metadata]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? 'hidden' : '';
  }, [isFilterOpen]);

  return (
    <div className='relative text-xs sm:text-[13px]'>
      {isCategoryPage && genderCategoryTitle && (
        <div className='flex  items-center flex-row px-4 sm:px-8 gap-1.5 pt-2 my-2'>
          <Link
            href={`/c/${currentGender}`}
            className='flex items-center uppercase gap-2  font-medium text-gray-500'
          >
            <span className='hover:text-black'>{currentGender}</span>
          </Link>
          <ChevronRight size={13} className='text-gray-500' />
          <h2 className=' font-medium w-fit uppercase'>
            {genderCategoryTitle === 'klanningar'
              ? 'klänningar'
              : genderCategoryTitle}
          </h2>
        </div>
      )}

      {isGenderPage && uniqueCategories.length > 0 && (
        <div className='px-5 sm:px-8 my-2 pt-2'>
          <div className='flex flex-wrap gap-4 uppercase font-medium'>
            <div className='text-black'>allt</div>
            {uniqueCategories.map((category) => (
              <Link
                key={category}
                href={`${pathname}/${category}`}
                className=' text-gray-500 w-fit font-medium hover:text-black'
              >
                {category === 'klanningar' ? 'klänningar' : category}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* --- Filterbar och filterpanel --- */}
      <FilterBar
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        isFilterOpen={isFilterOpen}
        totalCount={totalCount ?? 0}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
      />
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        metadata={metadata}
        selectedColors={selectedColors}
        selectedSizes={selectedSizes}
        sortOrder={sortOrder}
        onToggleColor={toggleColor}
        onToggleSize={toggleSize}
        onToggleSort={toggleSort}
        onClearFilters={clearFilters}
        onApplyFilters={applyFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* --- Produktgrid --- */}
      <div className='pt-2'>
        <InfinitePagination
          initialProducts={initialProducts}
          gender={gender}
          category={category}
          className={className}
          initialHasMore={initialHasMore}
        />
      </div>
    </div>
  );
}
