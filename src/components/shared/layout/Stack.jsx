import React from 'react';
import { cn } from '../../../utils/styles';

export default function Stack({
  children,
  direction = 'vertical',
  spacing = 4,
  align = 'stretch',
  justify = 'start',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex',
        {
          'flex-col': direction === 'vertical',
          'flex-row': direction === 'horizontal',
          'space-y-1': direction === 'vertical' && spacing === 1,
          'space-y-2': direction === 'vertical' && spacing === 2,
          'space-y-4': direction === 'vertical' && spacing === 4,
          'space-y-6': direction === 'vertical' && spacing === 6,
          'space-y-8': direction === 'vertical' && spacing === 8,
          'space-x-1': direction === 'horizontal' && spacing === 1,
          'space-x-2': direction === 'horizontal' && spacing === 2,
          'space-x-4': direction === 'horizontal' && spacing === 4,
          'space-x-6': direction === 'horizontal' && spacing === 6,
          'space-x-8': direction === 'horizontal' && spacing === 8,
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end',
          'justify-between': justify === 'between',
          'justify-around': justify === 'around'
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}