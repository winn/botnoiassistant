import React from 'react';

export default function SectionHeader({ title, description }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        {title}
      </label>
      {description && (
        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}