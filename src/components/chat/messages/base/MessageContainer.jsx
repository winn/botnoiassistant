import React from 'react';

export default function MessageContainer({ children, align = 'start' }) {
  const alignClasses = {
    start: 'justify-start',
    end: 'justify-end'
  };

  return (
    <div className={`max-w-3xl mx-auto flex ${alignClasses[align]}`}>
      {children}
    </div>
  );
}