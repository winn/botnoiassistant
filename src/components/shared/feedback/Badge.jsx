import React from 'react';
import { cn } from '../../../utils/styles';

export default function Badge({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        {
          // Variants
          'bg-sky-100 text-sky-800': variant === 'solid' && color === 'primary',
          'bg-gray-100 text-gray-800': variant === 'solid' && color === 'secondary',
          'bg-red-100 text-red-800': variant === 'solid' && color === 'danger',
          'border-2 border-sky-500 text-sky-500': variant === 'outline' && color === 'primary',
          'border-2 border-gray-500 text-gray-500': variant === 'outline' && color === 'secondary',
          'border-2 border-red-500 text-red-500': variant === 'outline' && color === 'danger',
          // Sizes
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-0.5 text-sm': size === 'md',
          'px-3 py-1 text-base': size === 'lg'
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}