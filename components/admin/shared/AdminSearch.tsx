'use client';

import React, {useState, useRef, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';

import {MotionCloseX} from '@/components/shared/AnimatedSidebar';

interface AdminSearchProps {
  redirectPath?: string;
  searchParam?: string;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}

const AdminSearch: React.FC<AdminSearchProps> = ({
  redirectPath,
  searchParam = 'search',
  maxLength = 50,
  placeholder = '',
  className,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentValue = searchParams.get(searchParam) || '';
  const [localValue, setLocalValue] = useState<string>(currentValue);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(currentValue);
    if (
      !currentValue.trim() &&
      document.activeElement !== searchInputRef.current
    ) {
      setIsExpanded(false);
    }
  }, [currentValue]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(searchParam, value);
    } else {
      params.delete(searchParam);
    }

    const targetPath = redirectPath || window.location.pathname;
    router.push(`${targetPath}?${params.toString()}`);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleFilterChange(e.target.value);
    }, 500);
  };

  const expandSearch = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!localValue.trim()) {
        setIsExpanded(false);
      }
    }, 150);
  };

  const handleClear = () => {
    setLocalValue('');
    handleFilterChange('');
    setIsExpanded(false);
    searchInputRef.current?.focus();
  };

  const placeholderText = isExpanded ? placeholder : 'SÖK';

  return (
    <div className={`w-full sm:w-auto mb-6 ml-1 ${className}`}>
      <div
        data-expanded={isExpanded}
        className='relative flex items-center transition-all duration-300 ease-in-out w-32 data-[expanded=true]:w-full sm:data-[expanded=true]:w-96'
      >
        <input
          ref={searchInputRef}
          type='text'
          value={localValue}
          onChange={handleInput}
          onClick={expandSearch}
          onFocus={expandSearch}
          onBlur={handleBlur}
          placeholder={placeholderText}
          maxLength={maxLength}
          autoComplete='off'
          className={`
            w-full h-8 pl-1 pt-0.5 pr-8 
            border-b search-input
            text-base
            transition-all duration-300 ease-in-out
           focus:outline-none
            cursor-pointer
            ${isExpanded ? 'is-expanded border-gray-400 cursor-text' : 'border-transparent   '}
          `}
        />
        {isExpanded && (
          <MotionCloseX
            onClick={handleClear}
            className='absolute -right-3 z-10 px-4 py-3 rounded-sm text-gray-500 hover:text-red-900'
          />
        )}

        
      </div>
    </div>
  );
};

export default AdminSearch;
