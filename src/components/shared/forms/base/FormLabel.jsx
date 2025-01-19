import React from 'react';

export default function FormLabel({ 
  children, 
  required, 
  className = '' 
}) {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className}`}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}