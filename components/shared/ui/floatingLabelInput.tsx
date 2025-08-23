'use client';

import * as React from 'react';
import {cn} from '@/utils/helpers';

interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(
  (
    {
      className,
      label,
      id,
      onFocus,
      onBlur,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Kombinera refs
    const combinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Kontrollera DOM-elementets faktiska värde
    const checkInputValue = React.useCallback(() => {
      if (inputRef.current) {
        setHasValue(inputRef.current.value !== '');
      }
    }, []);

    // Kontrollera initial värde och när props ändras
    React.useEffect(() => {
      checkInputValue();
    }, [checkInputValue, value, defaultValue]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      checkInputValue();
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      checkInputValue();
      onChange?.(e);
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className='relative'>
        <input
          {...props}
          id={id}
          ref={combinedRef}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'peer w-full border border-gray-400 bg-transparent px-3 pt-5 pb-1 text-base',
            'rounded-xs outline-none transition-all duration-200',
            'hover:border-black focus:border-black',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-destructive',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />

        <label
          htmlFor={id}
          className={cn(
            'absolute left-3 pointer-events-none select-none transition-all duration-200',
            isFloating
              ? 'top-1 text-xs text-black'
              : 'top-1/2 -translate-y-1/2 text-sm text-gray-500',
            'peer-focus:text-black peer-disabled:opacity-50'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';

export {FloatingLabelInput};
