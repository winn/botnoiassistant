import React from 'react';

export default function FormHelperText({ 
  children, 
  error, 
  className = '' 
}) {
  return (
    <p className={`
      text-sm ${error ? 'text-red-600' : 'text-gray-500'}
      ${className}
    `}>
      {children}
    </p>
  );
}