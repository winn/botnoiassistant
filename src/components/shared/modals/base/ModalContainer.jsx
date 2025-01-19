import React from 'react';

export default function ModalContainer({ children }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
}