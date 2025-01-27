import React from 'react';
import AgentModal from '../agents/modals/AgentFormModal';
import ToolModal from '../tools/ToolModal';
import AuthModal from '../auth/AuthModal';
import ClearHistoryModal from './ClearHistoryModal';
import ShareAgentModal from '../agents/modals/ShareAgentModal';
import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

export default function ModalContainer({ tools, onSaveAgent, onSaveTool }) {
  const { 
    modalState, 
    closeAgentModal, 
    closeToolModal,
    closeAuthModal,
    closeClearHistoryModal,
    closeShareAgentModal
  } = useModal();

  const { setUser, setUserProfile } = useAuth();
  const { clearHistory } = useChat();

  const handleLoginSuccess = (data) => {
    setUser(data.user);
    setUserProfile(data.profile);
    closeAuthModal();
  };

  const handleClearHistory = async () => {
    if (modalState.clearHistoryModal.agentId) {
      const success = await clearHistory(modalState.clearHistoryModal.agentId);
      if (success) {
        closeClearHistoryModal();
      }
    }
  };

  return (
    <>
      {modalState.agentModal.isOpen && (
        <AgentModal
          isOpen={true}
          onClose={closeAgentModal}
          onSave={onSaveAgent}
          agent={modalState.agentModal.data}
          tools={tools}
        />
      )}
      {modalState.toolModal.isOpen && (
        <ToolModal
          isOpen={true}
          onClose={closeToolModal}
          onSave={onSaveTool}
          tool={modalState.toolModal.data}
        />
      )}
      {modalState.authModal.isOpen && (
        <AuthModal
          isOpen={true}
          onClose={closeAuthModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {modalState.clearHistoryModal.isOpen && (
        <ClearHistoryModal
          isOpen={true}
          onClose={closeClearHistoryModal}
          onConfirm={handleClearHistory}
        />
      )}
      {modalState.shareAgentModal.isOpen && (
        <ShareAgentModal
          isOpen={true}
          onClose={closeShareAgentModal}
          agent={modalState.shareAgentModal.data}
        />
      )}
    </>
  );
}