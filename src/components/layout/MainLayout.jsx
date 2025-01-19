import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatContainer from '../chat/ChatContainer';
import { useChat } from '../../hooks/useChat';
import { useAudio } from '../../hooks/useAudio';
import { useVoiceState } from '../../hooks/useVoiceState';
import { useModal } from '../../contexts/ModalContext';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function MainLayout({
  agents,
  selectedAgentId,
  setSelectedAgentId,
  handleDeleteAgent,
  tools,
  onAddTool,
  onEditTool,
  handleDeleteTool,
  isLoading
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { openShareAgentModal } = useModal();
  
  const voiceState = useVoiceState();
  
  const { playAudio } = useAudio({
    onPlaybackComplete: () => {
      console.log('Audio playback completed');
      voiceState.finishSpeaking();
    }
  });

  const {
    streamingResponse,
    handleSubmit
  } = useChat({
    playAudio,
    onProcessingStart: () => {
      console.log('Processing started');
      voiceState.startProcessing();
    },
    onProcessingComplete: () => {
      console.log('Processing completed');
      voiceState.startSpeaking();
    }
  });

  const currentAgent = agents.find(a => a.id === selectedAgentId);

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading your agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-lg z-50 md:hidden overflow-y-auto"
          >
            <Sidebar
              agents={agents}
              selectedAgentId={selectedAgentId}
              onDeleteAgent={handleDeleteAgent}
              onSelectAgent={setSelectedAgentId}
              onShareAgent={openShareAgentModal}
              tools={tools}
              onAddTool={onAddTool}
              onEditTool={onEditTool}
              onDeleteTool={handleDeleteTool}
              onClose={() => setIsSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 bg-white shadow-lg overflow-y-auto">
        <div className="h-full p-6">
          <Sidebar
            agents={agents}
            selectedAgentId={selectedAgentId}
            onDeleteAgent={handleDeleteAgent}
            onSelectAgent={setSelectedAgentId}
            onShareAgent={openShareAgentModal}
            tools={tools}
            onAddTool={onAddTool}
            onEditTool={onEditTool}
            onDeleteTool={handleDeleteTool}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Fixed TopBar */}
        <div className="sticky top-0 z-10">
          <TopBar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            currentAgent={currentAgent}
          />
        </div>
        
        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatContainer
            agent={currentAgent}
            tools={tools}
            voiceState={voiceState}
            streamingResponse={streamingResponse}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}