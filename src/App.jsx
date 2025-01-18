import React from 'react';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ModalProvider } from './contexts/ModalContext';
import ModalContainer from './components/modals/ModalContainer';
import { useAgents } from './hooks/useAgents';
import { useTools } from './hooks/useTools';

function App() {
  const {
    agents,
    selectedAgentId,
    setSelectedAgentId,
    handleSaveAgent,
    handleDeleteAgent
  } = useAgents();

  const {
    tools,
    handleSaveTool
  } = useTools();

  return (
    <AuthProvider>
      <SettingsProvider>
        <ChatProvider>
          <ModalProvider>
            <MainLayout
              agents={agents}
              selectedAgentId={selectedAgentId}
              setSelectedAgentId={setSelectedAgentId}
              handleDeleteAgent={handleDeleteAgent}
              tools={tools}
            />
            <ModalContainer
              tools={tools}
              onSaveAgent={handleSaveAgent}
              onSaveTool={handleSaveTool}
            />
            <Toaster position="top-right" />
          </ModalProvider>
        </ChatProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;