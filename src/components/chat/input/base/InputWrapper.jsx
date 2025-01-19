import React from 'react';

export default function InputWrapper({ children }) {
  return (
    <div className="sticky bottom-0 w-full bg-white border-t shadow-sm">
      <div className="p-2 md:p-4">
        {children}
      </div>
    </div>
  );
}