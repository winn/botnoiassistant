import React from 'react';
import { cn } from '../../../utils/styles';

export default function Grid({
  children,
  cols = 1,
  gap = 4,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'grid',
        {
          'grid-cols-1': cols === 1,
          'grid-cols-2': cols === 2,
          'grid-cols-3': cols === 3,
          'grid-cols-4': cols === 4,
          'grid-cols-5': cols === 5,
          'grid-cols-6': cols === 6,
          'grid-cols-12': cols === 12,
          'gap-1': gap === 1,
          'gap-2': gap === 2,
          'gap-4': gap === 4,
          'gap-6': gap === 6,
          'gap-8': gap === 8,
          'gap-10': gap === 10,
          'gap-12': gap === 12
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}