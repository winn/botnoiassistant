import React from 'react';

export default function Card({ 
  children,
  variant = 'default',
  className = '' 
}) {
  const variantClasses = {
    default: 'bg-white shadow-sm hover:shadow-md',
    outlined: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md hover:shadow-lg'
  };

  return (
    <div className={`
      rounded-lg transition-shadow
      ${variantClasses[variant]}
      ${className}
    `}>
      {children}
    </div>
  );
}