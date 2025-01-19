import React from 'react';
import { cn } from '../../../utils/styles';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('px-6 py-4 border-b', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}