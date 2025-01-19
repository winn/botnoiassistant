import React from 'react';

export default function MessageAvatar({ 
  initials = 'AI',
  gradient = 'from-blue-500 to-blue-600'
}) {
  return (
    <div className={`
      w-8 h-8 rounded-full 
      bg-gradient-to-r ${gradient}
      flex items-center justify-center flex-shrink-0
    `}>
      <span className="text-white text-sm font-semibold">
        {initials.slice(0, 2)}
      </span>
    </div>
  );
}