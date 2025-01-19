import React from 'react';

export default function UserMessage({ content }) {
  return (
    <div className="mb-4">
      <div className="max-w-3xl mx-auto flex justify-end">
        <div className="max-w-[85%] bg-blue-500 text-white rounded-2xl px-4 py-2">
          <p className="text-[15px] whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}