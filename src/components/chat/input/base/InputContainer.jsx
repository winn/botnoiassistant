import React from 'react';

export default function InputContainer({ children }) {
  return (
    <div className="max-w-4xl mx-auto flex space-x-2">
      {children}
    </div>
  );
}