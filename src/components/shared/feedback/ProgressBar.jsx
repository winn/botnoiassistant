import React from 'react';
import { cn } from '../../../utils/styles';

export default function ProgressBar({
  value = 0,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  className,
  ...props
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="flex justify-between mb-1">
        {showLabel && (
          <div className="text-sm font-medium text-gray-700">
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>
      <div
        className={cn(
          'w-full rounded-full bg-gray-200',
          {
            'h-1': size === 'sm',
            'h-2': size === 'md',
            'h-3': size === 'lg'
          }
        )}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            {
              'bg-sky-500': color === 'primary',
              'bg-gray-500': color === 'secondary',
              'bg-red-500': color === 'danger',
              'h-1': size === 'sm',
              'h-2': size === 'md',
              'h-3': size === 'lg'
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}