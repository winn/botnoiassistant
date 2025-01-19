import React from 'react';
import ChatInput from './ChatInput';

export default function InputContainer({
  onSubmit,
  isProcessing,
  isSpeaking,
  isListening,
  onStartListening,
  onStopListening,
  disabled
}) {
  return (
    <div className="sticky bottom-0 w-full bg-white border-t shadow-sm">
      <ChatInput
        onSubmit={onSubmit}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        isListening={isListening}
        onStartListening={onStartListening}
        onStopListening={onStopListening}
        disabled={disabled}
      />
    </div>
  );
}