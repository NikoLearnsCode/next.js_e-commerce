'use client';

interface FilterBarProps {
  onToggleFilter: () => void;
  isFilterOpen: boolean;
  totalCount: number;
  activeFilterCount: number;
  hasActiveFilters: boolean;
}

export default function FilterBar({
  onToggleFilter,
  totalCount,
  activeFilterCount,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className='sticky top-14 w-full bg-white py-4 pb-5 px-4 sm:px-8 text-base flex justify-between items-center z-20'>
      <button
        onClick={onToggleFilter}
        className='flex items-center gap-2  hover:text-gray-700 transition-colors cursor-pointer'
      >
        <span
          className={`font-medium text-sm sm:text-[15px]  uppercase group ${hasActiveFilters ? 'text-black' : ''}`}
        >
          Filtrera och ordna{' '}
          {hasActiveFilters && (
            <span className='inline-flex items-center text-black '>
              ({activeFilterCount})
            </span>
          )}
        </span>
      </button>
      <span className=' text-xs  sm:text-sm'>
        {totalCount}{' '}
        <span className=''>{totalCount === 1 ? 'produkt' : 'produkter'}</span>
      </span>
    </div>
  );
}
