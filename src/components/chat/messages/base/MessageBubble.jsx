import React from 'react';

export default function MessageBubble({ 
  content, 
  variant = 'user',
  className = '' 
}) {
  const variantClasses = {
    user: 'bg-blue-500 text-white',
    assistant: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className={`
      rounded-2xl px-4 py-2 
      ${variantClasses[variant]} 
      ${className}
    `}>
      <p className="text-[15px] whitespace-pre-wrap break-words">
        {content}
      </p>
    </div>
  );
}