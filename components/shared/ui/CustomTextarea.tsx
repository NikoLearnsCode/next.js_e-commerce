'use client';

import * as React from 'react';
import {cn} from '@/styles/style.utils';

interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id?: string;
  error?: string;
  placeholder?: string;
}

const CustomTextarea = React.forwardRef<
  HTMLTextAreaElement,
  CustomTextareaProps
>(({className, label, id, error, placeholder, ...props}, ref) => {
  return (
    <div className='w-full'>
      {label && (
        <label className='text-sm block font-medium text-gray-700 mb-1' htmlFor={id}>
          {label}:
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        placeholder={placeholder}
        className={cn(
          'w-full border border-gray-400 rounded-xs text-sm px-3 py-2',
          'focus:outline-none  ',
          'hover:border-gray-600 h-24 transition-colors',
          'resize-none',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'placeholder:text-gray-400',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className='text-red-500 text-xs pl-1'>{error}</p>}
    </div>
  );
});

CustomTextarea.displayName = 'CustomTextarea';

export {CustomTextarea};
