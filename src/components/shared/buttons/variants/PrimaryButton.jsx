import React from 'react';
import BaseButton from '../base/BaseButton';

export default function PrimaryButton({ className = '', ...props }) {
  return (
    <BaseButton
      className={`bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500 ${className}`}
      {...props}
    />
  );
}