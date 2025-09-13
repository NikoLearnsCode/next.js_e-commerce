'use client';

import * as React from 'react';
import {cn} from '@/styles/style.utils';
import {CalendarCheck} from 'lucide-react';

interface CustomDateInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'value'
  > {
  label: string;
  id: string;
  hasError?: boolean;
  errorMessage?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
}

const CustomDateInput = React.forwardRef<
  HTMLInputElement,
  CustomDateInputProps
>(
  (
    {
      label,
      id,
      hasError,
      errorMessage,
      className,
      onFocus,
      onBlur,
      onChange,
      value,
      disabled,
      ...restProps
    },
    ref
  ) => {
    const elementRef = React.useRef<HTMLInputElement | null>(null);

    // Kombinera den externa ref med den interna elementRef
    const combinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        elementRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Funktion för att formatera datum till input-värde (YYYY-MM-DDTHH:MM)
    const formatDateForInput = (date: Date | null): string => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Funktion för att parse input-värde till Date
    const parseDateFromInput = (inputValue: string): Date | null => {
      if (!inputValue) return null;
      const date = new Date(inputValue);
      return isNaN(date.getTime()) ? null : date;
    };

    // Hantera klick på hela containern för att öppna date picker
    const handleContainerClick = () => {
      if (!disabled && elementRef.current) {
        elementRef.current.showPicker?.();
      }
    };

    return (
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'relative w-full border rounded-xs transition-all duration-200 cursor-pointer',
            'hover:border-gray-500',
            disabled && 'cursor-not-allowed opacity-50',
            hasError ? 'border-destructive' : 'border-gray-400/70'
          )}
          onClick={handleContainerClick}
        >
          <input
            id={id}
            type='datetime-local'
            {...restProps}
            ref={combinedRef}
            value={formatDateForInput(value || null)}
            disabled={disabled}
            className={cn(
              'w-full bg-transparent text-gray-500  font-medium px-3 h-12.5 pt-3.5 text-sm pr-12',
              'outline-none',
              'disabled:cursor-not-allowed',
              // Dölj standard calendar icon
              '[&::-webkit-calendar-picker-indicator]:opacity-0',
              '[&::-webkit-calendar-picker-indicator]:absolute',
              '[&::-webkit-calendar-picker-indicator]:inset-0',
              '[&::-webkit-calendar-picker-indicator]:cursor-pointer'
            )}
            placeholder={label}
            onFocus={(e) => {
              onFocus?.(e);
            }}
            onBlur={(e) => {
              onBlur?.(e);
            }}
            onChange={(e) => {
              const newDate = parseDateFromInput(e.target.value);
              onChange?.(newDate);
            }}
          />

          {/* Custom calendar icon */}
          <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
            <CalendarCheck
              strokeWidth={1.25}
              size={26}
              className={cn(
                'text-gray-500 transition-colors',
                hasError && 'text-destructive'
              )}
            />
          </div>

          {/* Label som alltid är synlig */}
          <label
            htmlFor={id}
            className={cn(
              'absolute left-3 top-1 text-xs text-gray-500 pointer-events-none',
              hasError ? 'text-destructive' : '',
              'disabled:opacity-50'
            )}
          >
            {label}
          </label>
        </div>

        {hasError && errorMessage && (
          <p className='text-xs ml-1 text-destructive mt-1'>{errorMessage}</p>
        )}
      </div>
    );
  }
);

CustomDateInput.displayName = 'CustomDateInput';

export {CustomDateInput};
