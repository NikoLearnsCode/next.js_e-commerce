'use client';

import * as React from 'react';
import NextLink from 'next/link';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '@/utils/helpers';

const linkVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium  disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-primary hover:underline',
        primary:
          'bg-primary text-primary-foreground active:bg-primary/90 hover:bg-primary/80 focus-visible:ring-primary/20 focus:bg-primary/90',
        destructive: 'bg-destructive text-white  hover:bg-destructive/90',
        outline:
          'border border-gray-400/70 bg-background  hover:bg-accent hover:text-accent-foreground',

        secondaryTwo:
          'bg-secondary/60 hover:bg-secondary active:bg-secondary focus:bg-secondary border border-secondary shadow-sm ',

        primaryTwo:
          'bg-primary/60 hover:bg-primary active:bg-primary focus:bg-primary border hover:border-primary border-primary text-primary-foreground text-white  shadow-sm ',

        secondary:
          'border border-gray-500/70  bg-background focus:bg-secondary/80  hover:bg-secondary/80 ',
        ghost: 'hover:bg-accent hover:text-accent-foreground',



        underline: 'text-xs text-primary underline-offset-4 hover:underline ',
      },
      size: {
        default: 'h-11  px-4 py-2',
        sm: 'h-8  gap-1.5 px-3',
        lg: 'h-10  px-6',
        md: 'h-9  px-4',
        icon: 'size-9',
        none: '',
      },
      width: {
        default: '',
        full: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      width: 'default',
    },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
  prefetch?: boolean;
}

function Link({
  className,
  variant,
  size,
  width,
  href,
  prefetch,
  onClick,
  children,
  ...props
}: LinkProps) {
  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      onClick={onClick}
      className={cn(linkVariants({variant, size, width, className}))}
      {...props}
    >
      {children}
    </NextLink>
  );
}

export {Link, linkVariants};
