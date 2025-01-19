import React from 'react';

export default function LiveRegion({ 
  message, 
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true 
}) {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
    >
      {message}
    </div>
  );
}