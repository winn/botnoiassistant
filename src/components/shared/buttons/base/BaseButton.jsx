import React from 'react';
import ButtonSpinner from './ButtonSpinner';

export default function BaseButton({
  children,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      {...props}
    >
      {loading && <ButtonSpinner className="mr-2" />}
      {children}
    </button>
  );
}