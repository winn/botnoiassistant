import React from 'react';

export default function ScreenReaderOnly({ children, as: Component = 'span' }) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}