import React from 'react';
import { motion } from 'framer-motion';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

export default function ChatMessage({ 
  message,
  isProcessing,
  streamingText,
  isLastMessage
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
    >
      {/* User Message */}
      <UserMessage content={message.userInput} />

      {/* Assistant Message */}
      {(message.aiResponse || (isProcessing && isLastMessage)) && (
        <AssistantMessage
          content={isProcessing && isLastMessage ? streamingText : message.aiResponse}
          agentName={message.agentName}
          isProcessing={isProcessing && isLastMessage}
        />
      )}
    </motion.div>
  );
}