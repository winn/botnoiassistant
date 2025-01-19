import React from 'react';
import ChatMessage from './ChatMessage';

export default function MessageList({ messages, isProcessing, streamingText }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-6 px-4 md:px-8 py-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.timestamp || index}
            message={message}
            isProcessing={isProcessing}
            streamingText={streamingText}
            isLastMessage={index === messages.length - 1}
          />
        ))}
      </div>
    </div>
  );
}