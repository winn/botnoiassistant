import React from 'react';

export default function ModalBody({ children, className = '' }) {
  return (
    <div className={`p-6 max-h-[calc(100vh-200px)] overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}