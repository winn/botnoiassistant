import React from 'react';
import { cn } from '../../../utils/styles';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div 
        className={cn(
          sizeClasses[size],
          'animate-spin rounded-full border-b-2 border-sky-500'
        )} 
      />
    </div>
  );
}