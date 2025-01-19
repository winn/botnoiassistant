import React from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

export default function VoiceButton({
  isListening,
  onStart,
  onStop,
  disabled = false,
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={isListening ? onStop : onStart}
      className={`
        ${sizeClasses[size]} rounded-lg transition-colors
        ${isListening ? 'bg-red-500 text-white' : 'bg-sky-100 text-sky-500'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}
      `}
      disabled={disabled}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? (
        <StopIcon className={iconSizes[size]} />
      ) : (
        <MicrophoneIcon className={iconSizes[size]} />
      )}
    </motion.button>
  );
}