import React from 'react';

export default function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex justify-end space-x-4 p-6 border-t ${className}`}>
      {children}
    </div>
  );
}