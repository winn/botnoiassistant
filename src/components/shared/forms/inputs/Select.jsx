import React from 'react';

export default function Select({
  label,
  value,
  onChange,
  options,
  helper,
  required,
  className = '',
  disabled = false
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full p-2 bg-white border rounded-lg 
          focus:ring-2 focus:ring-sky-500 focus:border-sky-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helper && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}