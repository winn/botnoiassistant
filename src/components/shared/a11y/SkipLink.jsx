import React from 'react';

export default function SkipLink({ target = '#main' }) {
  return (
    <a
      href={target}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:rounded-lg"
    >
      Skip to main content
    </a>
  );
}