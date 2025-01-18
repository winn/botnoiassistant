import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    agentModal: { isOpen: false, data: null },
    toolModal: { isOpen: false, data: null },
    authModal: { isOpen: false },
    clearHistoryModal: { isOpen: false, agentId: null }
  });

  const openAgentModal = (agent = null) => {
    setModalState(prev => ({
      ...prev,
      agentModal: { isOpen: true, data: agent }
    }));
  };

  const closeAgentModal = () => {
    setModalState(prev => ({
      ...prev,
      agentModal: { isOpen: false, data: null }
    }));
  };

  const openToolModal = (tool = null) => {
    setModalState(prev => ({
      ...prev,
      toolModal: { isOpen: true, data: tool }
    }));
  };

  const closeToolModal = () => {
    setModalState(prev => ({
      ...prev,
      toolModal: { isOpen: false, data: null }
    }));
  };

  const openAuthModal = () => {
    setModalState(prev => ({
      ...prev,
      authModal: { isOpen: true }
    }));
  };

  const closeAuthModal = () => {
    setModalState(prev => ({
      ...prev,
      authModal: { isOpen: false }
    }));
  };

  const openClearHistoryModal = (agentId) => {
    setModalState(prev => ({
      ...prev,
      clearHistoryModal: { isOpen: true, agentId }
    }));
  };

  const closeClearHistoryModal = () => {
    setModalState(prev => ({
      ...prev,
      clearHistoryModal: { isOpen: false, agentId: null }
    }));
  };

  const value = {
    modalState,
    openAgentModal,
    closeAgentModal,
    openToolModal,
    closeToolModal,
    openAuthModal,
    closeAuthModal,
    openClearHistoryModal,
    closeClearHistoryModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}