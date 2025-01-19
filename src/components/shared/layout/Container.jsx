import React from 'react';
import { cn } from '../../../utils/styles';

export default function Container({
  children,
  maxWidth = '7xl',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        {
          'max-w-screen-sm': maxWidth === 'sm',
          'max-w-screen-md': maxWidth === 'md',
          'max-w-screen-lg': maxWidth === 'lg',
          'max-w-screen-xl': maxWidth === 'xl',
          'max-w-screen-2xl': maxWidth === '2xl',
          'max-w-7xl': maxWidth === '7xl',
          'max-w-full': maxWidth === 'full'
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}