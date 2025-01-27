import React from 'react';
import { Toaster } from 'react-hot-toast';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './components/landing/LandingPage';
import SharedAgentView from './components/shared/SharedAgentView';
import TestSharedView from './components/shared/TestSharedView';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ModalProvider } from './contexts/ModalContext';
import { FeaturesProvider } from './contexts/FeaturesContext';
import ModalContainer from './components/modals/ModalContainer';
import { useAgents } from './hooks/useAgents';
import { useTools } from './hooks/useTools';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <LandingPage />;
}

function App() {
  const {
    agents,
    selectedAgentId,
    setSelectedAgentId,
    handleSaveAgent,
    handleDeleteAgent,
    isLoading: isLoadingAgents
  } = useAgents();

  const {
    tools,
    handleSaveTool,
    handleDeleteTool,
    isLoading: isLoadingTools
  } = useTools();

  const isLoading = isLoadingAgents || isLoadingTools;

  return (
    <HashRouter>
      <AuthProvider>
        <SettingsProvider>
          <ChatProvider>
            <ModalProvider>
              <FeaturesProvider>
                <Routes>
                  <Route path="/shared/:shareId" element={
                    <SharedAgentView tools={tools} />
                  } />
                  <Route path="/test/:shareId" element={
                    <TestSharedView tools={tools} />
                  } />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout
                        agents={agents}
                        selectedAgentId={selectedAgentId}
                        setSelectedAgentId={setSelectedAgentId}
                        handleDeleteAgent={handleDeleteAgent}
                        tools={tools}
                        onAddTool={() => {}}
                        onEditTool={() => {}}
                        handleDeleteTool={handleDeleteTool}
                        isLoading={isLoading}
                      />
                    </ProtectedRoute>
                  } />
                </Routes>
                <ModalContainer
                  tools={tools}
                  onSaveAgent={handleSaveAgent}
                  onSaveTool={handleSaveTool}
                />
                <Toaster position="top-right" />
              </FeaturesProvider>
            </ModalProvider>
          </ChatProvider>
        </SettingsProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;