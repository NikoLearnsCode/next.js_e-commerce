'use client';

import * as React from 'react';
import {cn} from '@/lib/helpers';
import {useRef} from 'react';

interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(({className, label, id, ...props}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value !== '');
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value !== '');
    props.onChange?.(e);
  };

  // Hantera form reset
  React.useEffect(() => {
    const input = document.getElementById(id);
    if (input) {
      const form = input.closest('form');
      if (form) {
        const resetListener = () => {
          setHasValue(false);
        };
        form.addEventListener('reset', resetListener);
        return () => {
          form.removeEventListener('reset', resetListener);
        };
      }
    }
  }, [id]);

  // Kontrollera initialt värde och hantera autofyll
  React.useEffect(() => {
    // Spara referens till input-elementet
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      inputRef.current = input;

      // Kontrollera om det finns ett initialt värde
      if (input.value !== '') {
        setHasValue(true);
      }

      // Starta en animation frame loop för att detektera autofyll
      const checkAutofill = () => {
        if (inputRef.current) {
          // Kontrollera om värdet har ändrats (kan hända vid autofyll)
          if (inputRef.current.value !== '' && !hasValue) {
            setHasValue(true);
          }
        }

        // Fortsätt loopen
        animationFrameRef.current = requestAnimationFrame(checkAutofill);
      };

      // Starta loopen
      animationFrameRef.current = requestAnimationFrame(checkAutofill);
    }

    // Städa upp när komponenten avmonteras
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [id, hasValue]);

  return (
    <div className='relative group'>
      <input
        id={id}
        data-slot='input'
        ref={(node) => {
          // Hantera både forwarded ref och vår lokala ref
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          inputRef.current = node;
        }}
        autoComplete='true'
        className={cn(
          'flex h-11 w-full rounded-xs min-w-0 border border-gray-400 bg-transparent px-3 pt-5 pb-1 text-base transition-all outline-none',
          'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'transition group-hover:border-black focus:border-black focus:ring-0',
          'autofill:bg-gray-50',
          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
      <label
        htmlFor={id}
        data-slot='label'
        className={cn(
          'absolute left-3 text-sm select-none pointer-events-none transition-all duration-200',
          'group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50',
          'text-gray-500',
          isFocused || hasValue ? 'top-1 text-xs' : 'top-1/2 -translate-y-1/2',
          isFocused ? 'text-black' : ''
        )}
      >
        {label}
      </label>
    </div>
  );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';
export {FloatingLabelInput};
