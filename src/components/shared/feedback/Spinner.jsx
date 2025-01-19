import React from 'react';
import { cn } from '../../../utils/styles';

export default function Spinner({
  size = 'md',
  color = 'primary',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        {
          'h-4 w-4': size === 'sm',
          'h-8 w-8': size === 'md',
          'h-12 w-12': size === 'lg',
          'text-sky-500': color === 'primary',
          'text-gray-500': color === 'secondary',
          'text-red-500': color === 'danger'
        },
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}