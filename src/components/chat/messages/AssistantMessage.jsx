import React from 'react';
import { motion } from 'framer-motion';

export default function AssistantMessage({ 
  content, 
  agentName, 
  isProcessing 
}) {
  return (
    <div className="mb-2">
      <div className="max-w-3xl mx-auto flex items-start space-x-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">
            {agentName?.slice(0, 2) || 'AI'}
          </span>
        </div>
        <div className="flex-1 max-w-[calc(100%-2.5rem)]">
          <div className="bg-gray-100 rounded-2xl px-4 py-2">
            <p className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
              {content}
              {isProcessing && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ▋
                </motion.span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}