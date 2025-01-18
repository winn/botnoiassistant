import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatContainer from '../chat/ChatContainer';
import { useChat } from '../../hooks/useChat';
import { useAudio } from '../../hooks/useAudio';

export default function MainLayout({
  agents,
  selectedAgentId,
  setSelectedAgentId,
  handleDeleteAgent,
  tools
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastInputMode, setLastInputMode] = useState('text');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const { playAudio } = useAudio({
    lastInputMode,
    onPlaybackComplete: () => {
      console.log('Audio playback completed, lastInputMode:', lastInputMode);
      if (lastInputMode === 'voice') {
        setIsVoiceMode(true);
      }
    }
  });

  const {
    isProcessing,
    streamingResponse,
    handleSubmit
  } = useChat({
    playAudio,
    onProcessingStart: () => {
      setIsVoiceMode(false);
    }
  });

  const currentAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-lg z-50 md:hidden"
          >
            <Sidebar
              agents={agents}
              selectedAgentId={selectedAgentId}
              onDeleteAgent={handleDeleteAgent}
              onSelectAgent={setSelectedAgentId}
              tools={tools}
              onClose={() => setIsSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 bg-white shadow-lg">
        <div className="h-full p-6 overflow-y-auto">
          <Sidebar
            agents={agents}
            selectedAgentId={selectedAgentId}
            onDeleteAgent={handleDeleteAgent}
            onSelectAgent={setSelectedAgentId}
            tools={tools}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          currentAgent={currentAgent}
        />
        <div className="flex-1 overflow-hidden p-4">
          <ChatContainer
            agent={currentAgent}
            tools={tools}
            isProcessing={isProcessing}
            streamingResponse={streamingResponse}
            onSubmit={handleSubmit}
            setLastInputMode={setLastInputMode}
            isVoiceMode={isVoiceMode}
            setIsVoiceMode={setIsVoiceMode}
          />
        </div>
      </div>
    </div>
  );
}