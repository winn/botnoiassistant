import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChat } from '../../contexts/ChatContext';
import { useSettings } from '../../contexts/SettingsContext';

export default function ChatContainer({ 
  agent,
  tools,
  voiceState,
  streamingResponse,
  onSubmit
}) {
  const chatEndRef = useRef(null);
  const { conversations, setConversations } = useChat();
  const { useSupabase } = useSettings();

  const handleSubmit = (input) => {
    onSubmit(input, agent, conversations, setConversations, tools, useSupabase);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <ChatHistory
          conversations={conversations}
          agentId={agent?.id}
          isProcessing={voiceState.isProcessing}
          streamingText={streamingResponse}
        />
        <div ref={chatEndRef} />
      </div>
      
      {/* Fixed Chat Input */}
      <div className="sticky bottom-0 w-full bg-white border-t shadow-sm">
        <ChatInput
          onSubmit={handleSubmit}
          voiceState={voiceState}
          startListening={voiceState.startListening}
          stopListening={voiceState.stopListening}
          setLastInputMode={voiceState.setLastInputMode}
        />
      </div>
    </div>
  );
}