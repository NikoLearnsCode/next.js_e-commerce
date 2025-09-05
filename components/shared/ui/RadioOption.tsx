'use client';

import React, {forwardRef, useRef} from 'react';

interface RadioOptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export const RadioOption = forwardRef<HTMLInputElement, RadioOptionProps>(
  ({id, label, ...props}, ref) => {
    // Vi skapar en lokal ref för att kunna interagera med den dolda inputen.
    const inputRef = useRef<HTMLInputElement | null>(null);

    // 1. Återinför din onKeyDown-hanterare, men med en viktig skillnad.
    const handleKeyDown = (event: React.KeyboardEvent) => {
      // Istället för att anropa en `onChange`-prop, simulerar vi ett
      // klick på den dolda input-taggen. Detta säkerställer att
      // React Hook Forms hela event-kedja körs korrekt.
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        inputRef.current?.click();
      }
    };

    return (
      <label
        htmlFor={id}
        className='flex items-center space-x-2 cursor-pointer'
      >
        <div className='relative'>
          <input
            type='radio'
            id={id}
            tabIndex={-1}
            className='sr-only'
            {...props}
            // Kombinerar den externa ref:en från RHF med vår lokala ref.
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
          />

          {/* 2. Återinför `tabIndex` och `onKeyDown` på den synliga div:en. */}
          <div
            className={`w-5 h-5 border ${props.checked ? 'border-black' : 'border-gray-300'} flex items-center justify-center`}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role='radio'
            aria-checked={props.checked}
          >
            {props.checked && (
              <svg
                className='w-4 h-4 text-black'
                viewBox='0 0 20 20'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            )}
          </div>
        </div>
        <span className='text-xs uppercase  cursor-pointer'>{label}</span>
      </label>
    );
  }
);

RadioOption.displayName = 'RadioOption';
