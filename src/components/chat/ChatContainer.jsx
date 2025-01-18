import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChat } from '../../contexts/ChatContext';
import { useSettings } from '../../contexts/SettingsContext';

export default function ChatContainer({ 
  agent,
  tools,
  isProcessing,
  streamingResponse,
  onSubmit,
  setLastInputMode,
  isVoiceMode,
  setIsVoiceMode
}) {
  const chatEndRef = useRef(null);
  const { conversations, setConversations } = useChat();
  const { useSupabase } = useSettings();

  const handleSubmit = (input) => {
    setLastInputMode(isVoiceMode ? 'voice' : 'text');
    onSubmit(input, agent, conversations, setConversations, tools, useSupabase);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <ChatHistory
          conversations={conversations}
          agentId={agent?.id}
          isProcessing={isProcessing}
          streamingText={streamingResponse}
        />
        <div ref={chatEndRef} />
      </div>
      
      {/* Chat Input */}
      <ChatInput
        isProcessing={isProcessing}
        onSubmit={handleSubmit}
        isVoiceMode={isVoiceMode}
        setIsVoiceMode={setIsVoiceMode}
      />
    </div>
  );
}