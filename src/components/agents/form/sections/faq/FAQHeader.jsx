import React from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import IconButton from '../../../../shared/buttons/icons/IconButton';

export default function FAQHeader({ onAdd }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Frequently Asked Questions
        </label>
        <p className="text-sm text-gray-500 mt-1">
          Add common questions and answers to help your agent respond consistently
        </p>
      </div>
      <IconButton
        icon={PlusIcon}
        onClick={onAdd}
        className="text-sky-500 hover:bg-sky-50"
        label="Add FAQ"
      />
    </div>
  );
}