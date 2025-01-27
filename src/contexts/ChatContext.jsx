import React, { createContext, useContext, useState } from 'react';
import { clearConversationHistory } from '../services/api';
import { toast } from 'react-hot-toast';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState({});
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const clearHistory = async (agentId) => {
    if (!agentId) {
      toast.error('No agent selected');
      return false;
    }

    try {
      await clearConversationHistory(agentId);
      setConversations(prev => ({ ...prev, [agentId]: [] }));
      toast.success('Chat history cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear chat history');
      return false;
    }
  };

  const value = {
    conversations,
    setConversations,
    streamingResponse,
    setStreamingResponse,
    isProcessing,
    setIsProcessing,
    clearHistory
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}