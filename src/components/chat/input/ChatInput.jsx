import React, { useState, useRef } from 'react';
import { useFeatureFlags } from '../../../contexts/FeaturesContext';
import { PaperAirplaneIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function ChatInput({
  onSubmit,
  isProcessing,
  isSpeaking,
  isListening,
  onStartListening,
  onStopListening,
  disabled = false
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const { isEnabled } = useFeatureFlags();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isProcessing && !isSpeaking && onSubmit) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 md:p-4">
      <div className="max-w-4xl mx-auto flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          disabled={disabled || isProcessing || isSpeaking}
        />
        
        {isEnabled('voice.enabled') && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`p-2 md:p-3 rounded-lg ${
              isListening ? 'bg-red-500 text-white' : 'bg-sky-100 text-sky-500'
            }`}
            disabled={disabled || isProcessing || isSpeaking}
          >
            {isListening ? (
              <StopIcon className="h-5 w-5" />
            ) : (
              <MicrophoneIcon className="h-5 w-5" />
            )}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={disabled || isProcessing || isSpeaking || !input.trim()}
          className={`p-2 md:p-3 rounded-lg bg-sky-500 text-white ${
            disabled || isProcessing || isSpeaking || !input.trim() 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-sky-600'
          }`}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </form>
  );
}