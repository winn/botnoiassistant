import React from 'react';
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/solid';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useModal } from '../../contexts/ModalContext';
import UserMenu from '../auth/UserMenu';
import TopMenu from './TopMenu';

export default function TopBar({ onOpenSidebar, currentAgent }) {
  const { isSpeakerOn, setIsSpeakerOn } = useSettings();
  const { user, userProfile } = useAuth();
  const { clearHistory } = useChat();
  const { openClearHistoryModal } = useModal();

  const handleClearHistory = () => {
    if (currentAgent) {
      openClearHistoryModal(currentAgent.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 md:p-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg hover:bg-sky-100 text-sky-500 md:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">
          {currentAgent?.name || 'Voice Assistant'}
        </h1>
      </div>
      <div className="flex items-center space-x-1 md:space-x-2">
        {currentAgent && (
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
            title="Clear chat history"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className={`p-2 rounded-lg ${
            isSpeakerOn ? 'bg-sky-100 text-sky-500' : 'text-gray-400'
          }`}
        >
          {isSpeakerOn ? '🔊' : '🔇'}
        </button>
        <UserMenu 
          user={user}
          profile={userProfile}
        />
        <TopMenu />
      </div>
    </div>
  );
}