'use client';

import {AnimatePresence} from 'framer-motion';
import {Accordion} from '@/components/shared/Accordion';
import {CheckboxOption} from '@/components/shared/CheckboxOption';
import {RadioOption} from '@/components/shared/RadioOption';

import {
  MotionCloseX,
  MotionOverlay,
  MotionDropdown,
} from '@/components/shared/AnimatedDropdown';
import {Button} from '@/components/shared/button';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  metadata?: {
    availableColors: string[];
    availableSizes: string[];
    availableCategories: string[];
  };
  selectedColors: string[];
  selectedSizes: string[];
  sortOrder: string | null;
  onToggleColor: (color: string) => void;
  onToggleSize: (size: string) => void;
  onToggleSort: (sort: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterPanel({
  isOpen,
  onClose,
  metadata,
  selectedColors,
  selectedSizes,
  sortOrder,
  onToggleColor,
  onToggleSize,
  onToggleSort,
  onClearFilters,
  onApplyFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  const sizes = metadata?.availableSizes || [];
  const colors = metadata?.availableColors || [];

  const label =
    sortOrder === 'price_asc'
      ? 'Pris: Lägst först'
      : sortOrder === 'price_desc'
        ? 'Pris: Högst först'
        : sortOrder === 'name_asc'
          ? 'Namn: A-Ö'
          : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDropdown
            position='right'
            key='filter-dropdown'
            className='max-w-full z-50 min-w-full md:max-w-[500px] md:min-w-[500px]'
          >
            <div className='flex flex-col h-full justify-between py-6 md:py-8 px-5 sm:px-10'>
              {/* --- Titel och stängknapp --- */}
              <div className='flex items-center justify-between mb-10'>
                <h1 className='text-sm sm:text-[15px] font-medium uppercase  '>
                  Filtrera och ordna
                </h1>
                <MotionCloseX
                  onClick={onClose}
                  size={14}
                  strokeWidth={1.5}
                  className=' p-2.5'
                />
              </div>

              {/* --- Innehåll (scroll) --- */}
              <div className='h-[calc(100vh-20rem)]  overflow-y-auto gap-4'>
                <Accordion.Root type='single' collapsible={true}>
                  {/* Storlekar */}
                  {sizes.length > 0 && (
                    <Accordion.Item value='sizes' className='border-b '>
                      <Accordion.Trigger>
                        <div className='flex flex-col'>
                          <span className='text-sm sm:text-base font-medium md:font-normal'>
                            Storlek
                          </span>
                          {selectedSizes.length > 0 && (
                            <span className='font-normal text-xs uppercase  text-gray-600 '>
                              {selectedSizes.join(', ')}
                            </span>
                          )}
                        </div>
                      </Accordion.Trigger>
                      <Accordion.Content>
                        <div className='grid grid-cols-1 gap-3 py-1'>
                          {sizes.map((size) => (
                            <CheckboxOption
                              key={size}
                              id={`size-${size}`}
                              label={size}
                              checked={selectedSizes.includes(size)}
                              onChange={() => onToggleSize(size)}
                            />
                          ))}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  )}

                  {/* Färger */}
                  {colors.length > 0 && (
                    <Accordion.Item value='colors' className='border-b'>
                      <Accordion.Trigger>
                        <div className='flex flex-col '>
                          <span className='text-sm sm:text-base font-medium md:font-normal'>
                            Färg
                          </span>
                          {selectedColors.length > 0 && (
                            <span className='font-normal text-xs uppercase font-syne text-gray-600 '>
                              {selectedColors.join(', ')}
                            </span>
                          )}
                        </div>
                      </Accordion.Trigger>
                      <Accordion.Content>
                        <div className='grid grid-cols-1 gap-4 py-1'>
                          {colors.map((color) => (
                            <CheckboxOption
                              key={color}
                              id={`color-${color}`}
                              label={color}
                              checked={selectedColors.includes(color)}
                              onChange={() => onToggleColor(color)}
                            />
                          ))}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  )}

                  {/* Sortering */}
                  <Accordion.Item value='sort' className='border-b  '>
                    <Accordion.Trigger>
                      <div className='flex flex-col'>
                        <span className='text-sm relative sm:text-base font-medium md:font-normal'>
                          Sortera efter
                        </span>
                        {sortOrder && (
                          <span className='font-normal  pt-1 text-xs uppercase  text-gray-600 '>
                            {label}
                          </span>
                        )}
                      </div>
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <div className='grid grid-cols-1 gap-4 py-1'>
                        <RadioOption
                          id='sort-price-asc'
                          label='Pris: Lägst först'
                          key='sort-price-asc'
                          checked={sortOrder === 'price_asc'}
                          onChange={() => onToggleSort('price_asc')}
                        />
                        <RadioOption
                          id='sort-price-desc'
                          label='Pris: Högst först'
                          key='sort-price-desc'
                          checked={sortOrder === 'price_desc'}
                          onChange={() => onToggleSort('price_desc')}
                        />
                        <RadioOption
                          id='sort-name-asc'
                          label='Namn: A-Ö'
                          key='sort-name-asc'
                          checked={sortOrder === 'name_asc'}
                          onChange={() => onToggleSort('name_asc')}
                        />
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>

              {/* --- Knappar längst ned --- */}
              <div className='flex flex-col'>
                <Button
                  variant='default'
                  className='w-full'
                  disabled={!hasActiveFilters}
                  onClick={onApplyFilters}
                >
                  Visa artiklar
                </Button>
                <Button
                  variant='outline'
                  className='mt-2 text-gray-600 w-full'
                  disabled={!hasActiveFilters}
                  onClick={onClearFilters}
                >
                  Rensa filter
                </Button>
              </div>
            </div>
          </MotionDropdown>

          {/* Overlay (bakgrundsdimning) */}
          <MotionOverlay
            key='filter-overlay'
            className='z-41'
            onClick={onClose}
          />
        </>
      )}
    </AnimatePresence>
  );
}
