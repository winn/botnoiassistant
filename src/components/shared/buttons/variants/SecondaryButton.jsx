import React from 'react';
import BaseButton from '../base/BaseButton';

export default function SecondaryButton({ className = '', ...props }) {
  return (
    <BaseButton
      className={`bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 ${className}`}
      {...props}
    />
  );
}