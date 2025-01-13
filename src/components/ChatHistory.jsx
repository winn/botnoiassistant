import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export default function ChatHistory({ conversations, agentId }) {
  const [expandedPayloads, setExpandedPayloads] = useState({});
  const agentConversations = conversations[agentId] || [];

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
            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          >
            {/* User Message */}
            <div className="mb-2">
              <div className="max-w-3xl mx-auto flex justify-end">
                <div className="max-w-[85%] bg-blue-500 text-white rounded-2xl px-4 py-2">
                  <p className="text-[15px]">{turn.userInput}</p>
                </div>
              </div>
            </div>
            
            {/* Debug Information */}
            {turn.debug && (
              <div className="max-w-3xl mx-auto mb-2">
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
                  <div className="mt-2 bg-gray-50 rounded-lg p-3">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Messages:</h4>
                        <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(turn.debug.messages, null, 2)}
                        </pre>
                      </div>
                      
                      {turn.debug.functions && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-1">Available Functions:</h4>
                          <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(turn.debug.functions, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {turn.debug.functionCall && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-1">Function Call:</h4>
                          <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(turn.debug.functionCall, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {turn.debug.functionResult && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-1">Function Result:</h4>
                          <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(turn.debug.functionResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Assistant Message */}
            <div className="mb-2">
              <div className="max-w-3xl mx-auto flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">AI</span>
                </div>
                <div className="max-w-[85%]">
                  <p className="text-[15px] leading-relaxed text-gray-700">{turn.aiResponse}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}