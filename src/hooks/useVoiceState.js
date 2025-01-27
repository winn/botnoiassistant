import { useState, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';

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
  const { textToSpeechEnabled, speechRecognitionEnabled } = useSettings();

  const startListening = useCallback(() => {
    if (!speechRecognitionEnabled) return;
    console.log('Starting listening...');
    setState(prev => ({ 
      ...prev, 
      voiceState: VoiceState.LISTENING,
      lastInputMode: 'voice'
    }));
  }, [speechRecognitionEnabled]);

  const stopListening = useCallback(() => {
    console.log('Stopping listening...');
    setState(prev => ({ ...prev, voiceState: VoiceState.IDLE }));
  }, []);

  const startProcessing = useCallback(() => {
    console.log('Starting processing...');
    setState(prev => ({ ...prev, voiceState: VoiceState.PROCESSING }));
  }, []);

  const startSpeaking = useCallback(() => {
    if (!textToSpeechEnabled) {
      console.log('Text-to-speech disabled, staying in IDLE state');
      setState(prev => ({ ...prev, voiceState: VoiceState.IDLE }));
      return;
    }
    console.log('Starting speaking...');
    setState(prev => ({ ...prev, voiceState: VoiceState.SPEAKING }));
  }, [textToSpeechEnabled]);

  const finishSpeaking = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        voiceState: prev.lastInputMode === 'voice' && speechRecognitionEnabled 
          ? VoiceState.LISTENING 
          : VoiceState.IDLE
      };
      console.log('Finished speaking, lastInputMode:', prev.lastInputMode, 'new state:', newState);
      return newState;
    });
  }, [speechRecognitionEnabled]);

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