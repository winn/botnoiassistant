import React from 'react';
import BaseButton from '../base/BaseButton';

export default function DangerButton({ className = '', ...props }) {
  return (
    <BaseButton
      className={`bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 ${className}`}
      {...props}
    />
  );
}