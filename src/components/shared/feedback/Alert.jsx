import React from 'react';
import { cn } from '../../../utils/styles';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

const icons = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon
};

export default function Alert({
  type = 'info',
  title,
  children,
  onClose,
  className,
  ...props
}) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        'rounded-lg p-4',
        {
          'bg-green-50 text-green-800': type === 'success',
          'bg-red-50 text-red-800': type === 'error',
          'bg-yellow-50 text-yellow-800': type === 'warning',
          'bg-blue-50 text-blue-800': type === 'info'
        },
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        {Icon && (
          <Icon
            className={cn('h-5 w-5 flex-shrink-0', {
              'text-green-400': type === 'success',
              'text-red-400': type === 'error',
              'text-yellow-400': type === 'warning',
              'text-blue-400': type === 'info'
            })}
          />
        )}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className="text-sm mt-1">{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-3 flex-shrink-0 inline-flex rounded-md p-1.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={onClose}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}