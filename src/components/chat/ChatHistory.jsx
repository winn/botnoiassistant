import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export default function ChatHistory({ conversations = [], agentId, isProcessing, streamingText }) {
  const [expandedPayloads, setExpandedPayloads] = useState({});
  const agentConversations = conversations[agentId] || [];
  const messagesEndRef = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentConversations, streamingText]);

  const togglePayload = (timestamp) => {
    setExpandedPayloads(prev => ({
      ...prev,
      [timestamp]: !prev[timestamp]
    }));
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-4">
      <AnimatePresence>
        {agentConversations.map((turn, index) => (
          <motion.div
            key={turn.timestamp || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
          >
            {/* User Message */}
            {turn.userInput && (
              <div className="mb-4">
                <div className="max-w-3xl mx-auto flex justify-end">
                  <div className="max-w-[85%] bg-sky-500 text-white rounded-2xl px-4 py-2 shadow-lg">
                    <p className="text-[15px] whitespace-pre-wrap break-words">
                      {turn.userInput}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Assistant Message */}
            {(turn.aiResponse || (isProcessing && index === agentConversations.length - 1)) && (
              <div className="mb-2">
                <div className="max-w-3xl mx-auto flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white text-sm font-semibold">
                      {turn.agentName?.slice(0, 2) || 'AI'}
                    </span>
                  </div>
                  <div className="flex-1 max-w-[calc(100%-2.5rem)]">
                    <div className="bg-white/80 backdrop-blur rounded-2xl px-4 py-2 shadow-lg">
                      <p className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
                        {isProcessing && index === agentConversations.length - 1 ? (
                          <>
                            {streamingText}
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ▋
                            </motion.span>
                          </>
                        ) : (
                          turn.aiResponse
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Information */}
            {turn.debug && (
              <div className="max-w-3xl mx-auto pl-12">
                <button
                  onClick={() => togglePayload(turn.timestamp)}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expandedPayloads[turn.timestamp] ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                  <span>Debug Info</span>
                </button>
                
                {expandedPayloads[turn.timestamp] && (
                  <div className="mt-2 bg-white/60 backdrop-blur rounded-lg p-3 shadow-lg">
                    <div className="space-y-4">
                      {Object.entries(turn.debug).map(([key, value]) => 
                        value && (
                          <div key={key}>
                            <h4 className="text-sm font-medium text-gray-600 mb-1 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </h4>
                            <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto break-words bg-white/60 p-2 rounded">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}