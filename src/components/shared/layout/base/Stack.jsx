import React from 'react';

export default function Stack({ 
  children, 
  direction = 'vertical',
  spacing = 4,
  className = '' 
}) {
  const directionClasses = {
    vertical: 'flex-col space-y',
    horizontal: 'flex-row space-x'
  };

  return (
    <div className={`
      flex ${directionClasses[direction]}-${spacing}
      ${className}
    `}>
      {children}
    </div>
  );
}