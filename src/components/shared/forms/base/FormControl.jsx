import React from 'react';

export default function FormControl({ children, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
    </div>
  );
}