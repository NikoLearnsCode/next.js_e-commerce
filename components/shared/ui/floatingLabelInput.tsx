'use client';

import * as React from 'react';
import {cn} from '@/styles/style.utils';

type FowardableElement = HTMLInputElement | HTMLTextAreaElement;

interface FloatingLabelBaseProps {
  label: string;
  id: string;
}

type FloatingLabelProps = FloatingLabelBaseProps &
  (
    | ({as?: 'input'} & React.InputHTMLAttributes<HTMLInputElement>)
    | ({as: 'textarea'} & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
  );

const FloatingLabelField = React.forwardRef<
  FowardableElement,
  FloatingLabelProps
>((allProps, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);
  const elementRef = React.useRef<FowardableElement | null>(null);

  const combinedRef = React.useCallback(
    (node: FowardableElement | null) => {
      elementRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );


  const checkElementValue = React.useCallback(() => {
    if (elementRef.current) {
      setHasValue(elementRef.current.value !== '');
    }
  }, []);

  React.useEffect(() => {
    checkElementValue();
  }, [checkElementValue]);

  const {id, label} = allProps;
  const isFloating = isFocused || hasValue;

  // ----- RENDERINGSBLOCK FÖR TEXTAREA -----
  if (allProps.as === 'textarea') {
    const {className, onFocus, onBlur, onChange, ...restProps} = allProps;

    return (
      <div className='relative'>
        <textarea
          {...restProps}
          ref={combinedRef as React.Ref<HTMLTextAreaElement>}
          className={cn(
            'peer w-full border border-gray-400 bg-transparent px-3 pt-5 pb-1 text-base',
            'rounded-xs outline-none transition-all duration-200 hover:border-black focus:border-black',
            'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
            'resize-none min-h-[80px]',
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            checkElementValue();
            onBlur?.(e);
          }}
          onChange={(e) => {
            checkElementValue();
            onChange?.(e);
          }}
        />
        <label
          htmlFor={id}
          className={cn(
            'absolute left-3 pointer-events-none select-none transition-all duration-200',
            isFloating
              ? 'top-1 text-xs text-black'
              : 'top-3 text-sm text-gray-500',
            'peer-focus:text-black peer-disabled:opacity-50'
          )}
        >
          {label}
        </label>
      </div>
    );
  }

  const {className, onFocus, onBlur, onChange, ...restProps} = allProps;

  return (
    <div className='relative'>
      <input
        {...restProps}
        ref={combinedRef as React.Ref<HTMLInputElement>}
        className={cn(
          'peer w-full border border-gray-400 bg-transparent px-3 pt-5 pb-1 text-base',
          'rounded-xs outline-none transition-all duration-200 hover:border-black focus:border-black',
          'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
          className
        )}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          checkElementValue();
          onBlur?.(e);
        }}
        onChange={(e) => {
          checkElementValue();
          onChange?.(e);
        }}
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
});

FloatingLabelField.displayName = 'FloatingLabelField';

export {FloatingLabelField as FloatingLabelInput};
