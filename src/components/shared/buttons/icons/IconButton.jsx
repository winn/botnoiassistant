import React from 'react';
import BaseButton from '../base/BaseButton';

export default function IconButton({ 
  icon: Icon,
  label,
  className = '',
  size = 'md',
  ...props 
}) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <BaseButton
      className={`rounded-lg hover:bg-gray-100 ${sizeClasses[size]} ${className}`}
      aria-label={label}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </BaseButton>
  );
}