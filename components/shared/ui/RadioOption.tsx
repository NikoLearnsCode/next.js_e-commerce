'use client';

import React, {forwardRef, useRef} from 'react';

interface RadioOptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

export const RadioOption = forwardRef<HTMLInputElement, RadioOptionProps>(
  ({id, label, children, className, ...props}, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleRadioClick = () => {
      inputRef.current?.click();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        inputRef.current?.click();
      }
    };

    const accessibilityProps = {
      tabIndex: 0,
      onKeyDown: handleKeyDown,
      onClick: handleRadioClick,
      role: 'radio',
      'aria-checked': props.checked,
      'aria-labelledby': label ? `${id}-label` : undefined,
    };

    return (
      <div className={className || 'flex items-center space-x-2'}>
        {/* Dold input för formulär-integration */}
        <input
          type='radio'
          id={id}
          tabIndex={-1}
          className='sr-only'
          {...props}
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
        />

        {/* Custom children med klickbar radio-funktionalitet */}
        {children && React.isValidElement(children) ? (
          // Klonar det yttre elementet i `children` och injicerar accessibilityProps
          React.cloneElement(children as React.ReactElement, accessibilityProps)
        ) : (
          // Standard-läget - endast radio-knappen är klickbar
          <>
            <div className='relative'>
              <div
                className={`w-5 h-5 border cursor-pointer ${
                  props.checked ? 'border-black' : 'border-gray-300'
                } flex items-center justify-center hover:border-gray-500 transition-colors`}
                {...accessibilityProps}
              >
                {props.checked && (
                  <svg
                    className='w-4 h-4 text-black'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    xmlns='http://www.w3.org/2000/svg'
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
            </div>
            {label && (
              <span
                id={`${id}-label`}
                className='text-xs uppercase w-fit select-none'
              >
                {label}
              </span>
            )}
          </>
        )}
      </div>
    );
  }
);

RadioOption.displayName = 'RadioOption';
