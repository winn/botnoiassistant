import React, { forwardRef } from 'react';

const TextInput = forwardRef(({ value, onChange, disabled, onSubmit }, ref) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type your message..."
      className="flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      disabled={disabled}
    />
  );
});

TextInput.displayName = 'TextInput';
export default TextInput;