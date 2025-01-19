import React, { useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

export default function ChatContainer({ 
  agent,
  tools,
  voiceState,
  streamingResponse,
  onSubmit
}) {
  const chatEndRef = useRef(null);
  const { conversations, setConversations } = useChat();

  const handleSubmit = (input) => {
    if (!input.trim() || !onSubmit) return;
    onSubmit(input, agent, conversations, setConversations, tools);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-sm">
        <ChatHistory
          conversations={conversations}
          agentId={agent?.id}
          isProcessing={voiceState?.isProcessing}
          streamingText={streamingResponse}
        />
        <div ref={chatEndRef} />
      </div>
      
      {/* Fixed Chat Input */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur border-t border-white/20">
        <ChatInput
          onSubmit={handleSubmit}
          disabled={voiceState?.isProcessing || voiceState?.isSpeaking}
        />
      </div>
    </div>
  );
}