import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import IconButton from '../../shared/buttons/icons/IconButton';

export default function SendButton({ onClick, disabled }) {
  return (
    <IconButton
      icon={PaperAirplaneIcon}
      onClick={onClick}
      className="bg-sky-500 text-white hover:bg-sky-600"
      label="Send message"
      disabled={disabled}
    />
  );
}