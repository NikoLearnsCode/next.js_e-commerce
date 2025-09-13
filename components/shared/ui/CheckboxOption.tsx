'use client';
import {twMerge} from 'tailwind-merge';
import React, {forwardRef, useRef} from 'react';

interface CheckboxOptionProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  className?: string;
  svgClassName?: string;
  labelClassName?: string;
}

export const CheckboxOption = forwardRef<HTMLInputElement, CheckboxOptionProps>(
  ({id, label, className, svgClassName, labelClassName, ...props}, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleCheckboxClick = () => {
      inputRef.current?.click();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        inputRef.current?.click();
      }
    };

    return (
      <div className='flex w-fit items-center space-x-2'>
        {/* Klickbar checkbox - endast denna del triggar aktivering */}
        <div
          className={twMerge(
            'w-5 h-5 border cursor-pointer',
            props.checked ? 'border-black' : 'border-gray-300',
            'flex items-center justify-center',
            'hover:border-gray-500 transition-colors',
            className
          )}
          role='checkbox'
          aria-checked={props.checked}
          aria-labelledby={`${id}-label`}
          tabIndex={0}
          onClick={handleCheckboxClick}
          onKeyDown={handleKeyDown}
        >
          {props.checked && (
            <svg
              className={twMerge('w-4 h-4 text-black', svgClassName)}
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>

        {/* Dold input för formulär-integration */}
        <input
          type='checkbox'
          id={id}
          className='sr-only'
          {...props}
          tabIndex={-1}
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
        />

        {/* Text-label - INTE klickbar */}
        <span
          id={`${id}-label`}
          className={twMerge(
            'text-xs uppercase w-fit select-none',
            labelClassName
          )}
        >
          {label}
        </span>
      </div>
    );
  }
);

CheckboxOption.displayName = 'CheckboxOption';
