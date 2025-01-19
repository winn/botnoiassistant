import React from 'react';
import { cn } from '../../../utils/styles';

export function Table({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          'min-w-full divide-y divide-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function Thead({ children, className, ...props }) {
  return (
    <thead
      className={cn('bg-gray-50', className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function Tbody({ children, className, ...props }) {
  return (
    <tbody
      className={cn(
        'divide-y divide-gray-200 bg-white',
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function Tr({ children, className, ...props }) {
  return (
    <tr
      className={cn(
        'hover:bg-gray-50 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function Th({ children, className, ...props }) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, ...props }) {
  return (
    <td
      className={cn(
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}