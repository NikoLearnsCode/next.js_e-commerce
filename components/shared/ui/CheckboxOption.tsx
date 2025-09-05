'use client';
import {twMerge} from 'tailwind-merge';
import React, {forwardRef, useRef} from 'react';

interface CheckboxOptionProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  className?: string;
  svgClassName?: string;
  labelClassName?: string; // Ny prop för text-label
}

export const CheckboxOption = forwardRef<HTMLInputElement, CheckboxOptionProps>(
  // Plocka ut alla tre custom className props
  ({id, label, className, svgClassName, labelClassName, ...props}, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleKeyDown = (event: React.KeyboardEvent) => {
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
        <div
          // För div:en
          className={twMerge(
            'w-5 h-5 border',
            props.checked ? 'border-black' : 'border-gray-300',
            'flex items-center justify-center',
            className
          )}
          role='checkbox'
          aria-checked={props.checked}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {props.checked && (
            <svg
              // För SVGen
              className={twMerge('w-4 h-4 text-black', svgClassName)}
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>

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

        <span
          // För texten
          className={twMerge(
            'text-xs uppercase cursor-pointer',
            labelClassName
          )}
        >
          {label}
        </span>
      </label>
    );
  }
);

CheckboxOption.displayName = 'CheckboxOption';
