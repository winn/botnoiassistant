import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import IconButton from '../buttons/icons/IconButton';

export default function ModalHeader({ title, onClose }) {
  return (
    <div className="flex justify-between items-center p-6 border-b">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <IconButton
        icon={XMarkIcon}
        onClick={onClose}
        className="text-gray-500"
        label="Close modal"
      />
    </div>
  );
}