import { useState, useCallback } from 'react';

// Voice state machine states
const VoiceState = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking'
};

export function useVoiceState() {
  const [state, setState] = useState({
    voiceState: VoiceState.IDLE,
    lastInputMode: 'text'
  });

  const startListening = useCallback(() => {
    console.log('Starting listening...');
    setState(prev => ({ 
      ...prev, 
      voiceState: VoiceState.LISTENING,
      lastInputMode: 'voice' // Set lastInputMode when starting to listen
    }));
  }, []);

  const stopListening = useCallback(() => {
    console.log('Stopping listening...');
    setState(prev => ({ ...prev, voiceState: VoiceState.IDLE }));
  }, []);

  const startProcessing = useCallback(() => {
    console.log('Starting processing...');
    setState(prev => ({ ...prev, voiceState: VoiceState.PROCESSING }));
  }, []);

  const startSpeaking = useCallback(() => {
    console.log('Starting speaking...');
    setState(prev => ({ ...prev, voiceState: VoiceState.SPEAKING }));
  }, []);

  const finishSpeaking = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        voiceState: prev.lastInputMode === 'voice' ? VoiceState.LISTENING : VoiceState.IDLE
      };
      console.log('Finished speaking, lastInputMode:', prev.lastInputMode, 'new state:', newState);
      return newState;
    });
  }, []);

  const setLastInputMode = useCallback((mode) => {
    console.log('Setting last input mode:', mode);
    setState(prev => ({ ...prev, lastInputMode: mode }));
  }, []);

  return {
    voiceState: state.voiceState,
    isListening: state.voiceState === VoiceState.LISTENING,
    isProcessing: state.voiceState === VoiceState.PROCESSING,
    isSpeaking: state.voiceState === VoiceState.SPEAKING,
    startListening,
    stopListening,
    startProcessing,
    startSpeaking,
    finishSpeaking,
    lastInputMode: state.lastInputMode,
    setLastInputMode
  };
}