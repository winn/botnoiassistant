import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useSettings } from '../../contexts/SettingsContext';

export default function ChatContainer({ 
  agent,
  tools,
  voiceState,
  streamingResponse,
  onSubmit,
  conversations,
  setConversations
}) {
  const chatEndRef = useRef(null);
  const { conversations: contextConversations, setConversations: setContextConversations } = useChat();
  const { textToSpeechEnabled } = useSettings();
  const prevAgentIdRef = useRef(null);

  // Use either provided conversations or context conversations
  const currentConversations = conversations || contextConversations;
  const currentSetConversations = setConversations || setContextConversations;

  // Auto-scroll effect
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversations, streamingResponse]);

  // Send greeting message when agent changes
  useEffect(() => {
    if (agent?.id && agent.id !== prevAgentIdRef.current && agent.greeting) {
      // Add greeting message to conversation
      currentSetConversations(prev => ({
        ...prev,
        [agent.id]: [
          ...(prev[agent.id] || []),
          {
            aiResponse: agent.greeting,
            timestamp: Date.now(),
            agentId: agent.id,
            agentName: agent.name,
            isGreeting: true
          }
        ]
      }));
    }
    prevAgentIdRef.current = agent?.id;
  }, [agent?.id, agent?.greeting]);

  const handleSubmit = (input) => {
    if (!input.trim() || !onSubmit) return;
    onSubmit(input, agent, currentConversations, currentSetConversations, tools);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-sm">
        <ChatHistory
          conversations={currentConversations}
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
          disabled={voiceState?.isProcessing || (textToSpeechEnabled && voiceState?.isSpeaking)}
        />
      </div>
    </div>
  );
}