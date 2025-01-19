import React from 'react';

export default function EmptyFAQState({ onAdd }) {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
      <p className="text-gray-500">No FAQs added yet</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 text-sky-500 hover:text-sky-600 text-sm font-medium"
      >
        Add your first FAQ
      </button>
    </div>
  );
}