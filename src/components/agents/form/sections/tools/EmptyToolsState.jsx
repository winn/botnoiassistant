import React from 'react';

export default function EmptyToolsState() {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
      <p className="text-gray-500">No tools available</p>
      <p className="text-sm text-gray-400 mt-1">
        Add tools in the Tools section first
      </p>
    </div>
  );
}