import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon, StopIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

// Helper function to detect iOS
const isIOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

export default function ChatInput({ 
  onSubmit, 
  voiceState, 
  startListening, 
  stopListening, 
  setLastInputMode 
}) {
  const [userInput, setUserInput] = useState('');
  const inputRef = useRef(null);
  const isListening = voiceState.isListening;
  const isIosDevice = isIOS();

  const { startSpeechRecognition, stopSpeechRecognition } = useSpeechRecognition({
    onTranscriptChange: (text) => {
      console.log('Transcript changed:', text);
      setUserInput(text);
    },
    onSpeechEnd: (transcript) => {
      console.log('Speech ended with transcript:', transcript);
      if (transcript.trim()) {
        setLastInputMode('voice');
        onSubmit(transcript);
        setUserInput('');
        stopListening();
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      setLastInputMode('text');
      onSubmit(userInput.trim());
      setUserInput('');
    }
  };

  const toggleSpeech = () => {
    if (isListening) {
      console.log('Stopping speech...');
      stopSpeechRecognition();
      stopListening();
    } else {
      console.log('Starting speech...');
      startListening();
    }
  };

  // Start/stop speech recognition based on voice state
  useEffect(() => {
    if (isListening && !voiceState.isProcessing && !voiceState.isSpeaking) {
      console.log('Voice state triggered speech recognition start');
      startSpeechRecognition();
    } else if (!isListening) {
      console.log('Voice state triggered speech recognition stop');
      stopSpeechRecognition();
    }
  }, [isListening, voiceState.isProcessing, voiceState.isSpeaking, startSpeechRecognition, stopSpeechRecognition]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = () => {
      if (isListening) {
        console.log('Keyboard input detected, stopping speech');
        stopSpeechRecognition();
        stopListening();
      }
    };

    inputRef.current?.addEventListener('keydown', handleKeyDown);
    return () => inputRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [isListening, stopSpeechRecognition, stopListening]);

  const isDisabled = voiceState.isProcessing || voiceState.isSpeaking;

  return (
    <form onSubmit={handleSubmit} className="p-2 md:p-4">
      <div className="max-w-4xl mx-auto flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          disabled={isDisabled}
        />
        {!isIosDevice && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={toggleSpeech}
            className={`p-2 md:p-3 rounded-lg ${
              isListening ? 'bg-red-500' : 'bg-sky-500'
            } text-white`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            disabled={isDisabled}
          >
            {isListening ? (
              <StopIcon className="h-5 w-5" />
            ) : (
              <MicrophoneIcon className="h-5 w-5" />
            )}
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isDisabled || !userInput.trim()}
          className={`p-2 md:p-3 rounded-lg bg-sky-500 text-white ${
            isDisabled || !userInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-600'
          }`}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </form>
  );
}