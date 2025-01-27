import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveCredential, loadCredential } from '../services/storage';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    openaiKey: '',
    claudeKey: '',
    geminiKey: '',
    botnoiToken: '',
    speechRecognitionEnabled: true,
    textToSpeechEnabled: true
  });
  
  const { user } = useAuth();

  // Load credentials whenever user changes
  useEffect(() => {
    async function loadCredentials() {
      if (user) {
        try {
          const [
            savedOpenaiKey,
            savedClaudeKey,
            savedGeminiKey,
            savedBotnoiToken
          ] = await Promise.all([
            loadCredential('openai'),
            loadCredential('claude'),
            loadCredential('gemini'),
            loadCredential('botnoi')
          ]);

          setSettings(prev => ({
            ...prev,
            openaiKey: savedOpenaiKey || '',
            claudeKey: savedClaudeKey || '',
            geminiKey: savedGeminiKey || '',
            botnoiToken: savedBotnoiToken || ''
          }));
        } catch (error) {
          console.error('Failed to load credentials:', error);
          toast.error('Failed to load saved credentials');
        }
      }
    }
    loadCredentials();
  }, [user]);

  const setOpenaiKey = async (newKey) => {
    try {
      setSettings(prev => ({ ...prev, openaiKey: newKey }));
      if (newKey) {
        await saveCredential('openai', newKey);
        toast.success('OpenAI API key saved successfully');
      }
    } catch (error) {
      console.error('Failed to save OpenAI key:', error);
      toast.error('Failed to save OpenAI key');
    }
  };

  const setClaudeKey = async (newKey) => {
    try {
      setSettings(prev => ({ ...prev, claudeKey: newKey }));
      if (newKey) {
        await saveCredential('claude', newKey);
        toast.success('Claude API key saved successfully');
      }
    } catch (error) {
      console.error('Failed to save Claude key:', error);
      toast.error('Failed to save Claude key');
    }
  };

  const setGeminiKey = async (newKey) => {
    try {
      setSettings(prev => ({ ...prev, geminiKey: newKey }));
      if (newKey) {
        await saveCredential('gemini', newKey);
        toast.success('Gemini API key saved successfully');
      }
    } catch (error) {
      console.error('Failed to save Gemini key:', error);
      toast.error('Failed to save Gemini key');
    }
  };

  const setBotnoiToken = async (newToken) => {
    try {
      setSettings(prev => ({ ...prev, botnoiToken: newToken }));
      if (newToken) {
        await saveCredential('botnoi', newToken);
        toast.success('Botnoi token saved successfully');
      }
    } catch (error) {
      console.error('Failed to save Botnoi token:', error);
      toast.error('Failed to save Botnoi token');
    }
  };

  const setSpeechRecognitionEnabled = (enabled) => {
    setSettings(prev => ({ ...prev, speechRecognitionEnabled: enabled }));
  };

  const setTextToSpeechEnabled = (enabled) => {
    setSettings(prev => ({ ...prev, textToSpeechEnabled: enabled }));
  };

  const value = {
    // API Keys
    openaiKey: settings.openaiKey,
    setOpenaiKey,
    claudeKey: settings.claudeKey,
    setClaudeKey,
    geminiKey: settings.geminiKey,
    setGeminiKey,
    botnoiToken: settings.botnoiToken,
    setBotnoiToken,
    
    // Feature Flags
    speechRecognitionEnabled: settings.speechRecognitionEnabled,
    setSpeechRecognitionEnabled,
    textToSpeechEnabled: settings.textToSpeechEnabled,
    setTextToSpeechEnabled
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