import React from 'react';

export default function InputField({ value, onChange, disabled, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      disabled={disabled}
    />
  );
}