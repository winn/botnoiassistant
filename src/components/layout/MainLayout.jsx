import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatContainer from '../chat/ChatContainer';
import { useChat } from '../../hooks/useChat';
import { useAudio } from '../../hooks/useAudio';
import { useVoiceState } from '../../hooks/useVoiceState';
import { useModal } from '../../contexts/ModalContext';
import LoadingSpinner from '../shared/feedback/LoadingSpinner';

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
  const { openShareAgentModal } = useModal();
  const voiceState = useVoiceState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { playAudio } = useAudio({
    onPlaybackComplete: () => voiceState.finishSpeaking()
  });

  const {
    streamingResponse,
    handleSubmit
  } = useChat({
    playAudio,
    onProcessingStart: () => voiceState.startProcessing(),
    onProcessingComplete: () => voiceState.startSpeaking()
  });

  const currentAgent = agents.find(a => a.id === selectedAgentId);

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-50">
        <div className="text-center animate-fade-in">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-surface-600 font-medium">Loading your agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex bg-gradient-to-br from-sky-50 to-indigo-50">
      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-0 z-40 md:hidden
        ${isSidebarOpen ? 'block' : 'hidden'}
      `}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-80 bg-white/80 backdrop-blur-lg border-r border-white/20">
          <div className="h-full p-6">
            <Sidebar
              agents={agents}
              selectedAgentId={selectedAgentId}
              onDeleteAgent={handleDeleteAgent}
              onSelectAgent={(id) => {
                setSelectedAgentId(id);
                setIsSidebarOpen(false);
              }}
              onShareAgent={openShareAgentModal}
              tools={tools}
              onAddTool={onAddTool}
              onEditTool={onEditTool}
              onDeleteTool={handleDeleteTool}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 bg-white/80 backdrop-blur-lg border-r border-white/20">
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
            currentAgent={currentAgent} 
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        </div>
        
        {/* Chat Area */}
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