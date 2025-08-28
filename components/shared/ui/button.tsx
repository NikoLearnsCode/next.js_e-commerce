'use client';
import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/utils/helpers';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap  text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/90 focus-visible:ring-primary/20 focus:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border border-gray-400/70 bg-background  hover:bg-accent hover:text-accent-foreground transition-all duration-200',
        secondary:
          'bg-gray-white border border-gray-300 hover:border-gray-400 text-secondary-foreground shadow-xs active:bg-secondary/80 hover:bg-secondary/60 transition',

        ghost: 'hover:bg-accent hover:text-accent-foreground',

        link: 'text-primary underline-offset-4 hover:underline ',
        underline:
          'text-xs text-primary underline-offset-4 active:underline hover:underline ',
      },
      size: {
        default: 'h-11  px-4 py-2 mt-6 has-[>svg]:px-4',
        sm: 'h-8  gap-1.5 px-3 has-[>svg]:px-2.5',
        profile: 'h-6 mt-2',
        lg: 'h-10  px-6 has-[>svg]:px-4',
        icon: 'size-9',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    />
  );
}

export {Button, buttonVariants};
