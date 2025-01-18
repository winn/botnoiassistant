import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveCredential, loadCredential } from '../services/storage';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [apiKey, setApiKey] = useState('');
  const [botnoiToken, setBotnoiToken] = useState('');
  const [useSupabase, setUseSupabase] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const { user } = useAuth();

  // Load credentials whenever user changes
  useEffect(() => {
    async function loadCredentials() {
      console.log('Loading credentials for user:', user?.id);
      const savedApiKey = await loadCredential('openai');
      const savedBotnoiToken = await loadCredential('botnoi');
      if (savedApiKey) setApiKey(savedApiKey);
      if (savedBotnoiToken) setBotnoiToken(savedBotnoiToken);
    }
    loadCredentials();
  }, [user]); // Reload when user changes

  const handleApiKeyChange = async (newApiKey) => {
    setApiKey(newApiKey);
    
    if (newApiKey) {
      const saved = await saveCredential('openai', newApiKey);
      if (saved) {
        toast.success('API key saved successfully');
      }
    }
  };

  const handleBotnoiTokenChange = async (newToken) => {
    setBotnoiToken(newToken);
    
    if (newToken) {
      const saved = await saveCredential('botnoi', newToken);
      if (saved) {
        toast.success('Botnoi token saved successfully');
      }
    }
  };

  const value = {
    apiKey,
    setApiKey: handleApiKeyChange,
    botnoiToken,
    setBotnoiToken: handleBotnoiTokenChange,
    useSupabase,
    setUseSupabase,
    isSpeakerOn,
    setIsSpeakerOn
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}