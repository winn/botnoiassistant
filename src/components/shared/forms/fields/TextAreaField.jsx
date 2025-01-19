import React from 'react';
import FormField from './FormField';

export default function TextAreaField({
  label,
  error,
  helper,
  required,
  className = '',
  textAreaClassName = '',
  ...props
}) {
  return (
    <FormField
      label={label}
      error={error}
      helper={helper}
      required={required}
      className={className}
    >
      <textarea
        className={`
          w-full p-2 border rounded-lg 
          focus:ring-2 focus:ring-sky-500 focus:border-sky-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${textAreaClassName}
        `}
        {...props}
      />
    </FormField>
  );
}