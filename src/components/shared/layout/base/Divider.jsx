import React from 'react';

export default function Divider({ 
  orientation = 'horizontal',
  className = '' 
}) {
  const orientationClasses = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px'
  };

  return (
    <hr className={`
      ${orientationClasses[orientation]} 
      bg-gray-200 border-0
      ${className}
    `} />
  );
}