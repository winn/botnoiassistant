import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon, StopIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function ChatInput({ isProcessing, onSubmit, isVoiceMode, setIsVoiceMode }) {
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);

  const { startSpeechRecognition, stopSpeechRecognition } = useSpeechRecognition({
    onTranscriptChange: setUserInput,
    onSpeechEnd: (transcript) => {
      if (transcript.trim()) {
        onSubmit(transcript);
        setUserInput(''); // Clear input after sending
      }
      setIsListening(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      setIsVoiceMode(false); // Exit voice mode when typing
      onSubmit(userInput.trim());
      setUserInput('');
    }
  };

  const toggleSpeech = () => {
    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
      setIsVoiceMode(false);
    } else {
      setIsVoiceMode(true);
      setIsListening(true);
      startSpeechRecognition();
    }
  };

  // Stop listening when processing starts (including TTS)
  useEffect(() => {
    if (isProcessing && isListening) {
      console.log('Processing started, stopping speech recognition');
      stopSpeechRecognition();
      setIsListening(false);
    }
  }, [isProcessing, isListening, stopSpeechRecognition]);

  // Start listening when voice mode is enabled
  useEffect(() => {
    if (isVoiceMode && !isListening && !isProcessing) {
      console.log('Voice mode enabled, starting speech recognition');
      setIsListening(true);
      startSpeechRecognition();
    }
  }, [isVoiceMode, isListening, isProcessing, startSpeechRecognition]);

  // Exit voice mode when user starts typing
  useEffect(() => {
    const handleKeyDown = () => {
      if (isVoiceMode) {
        console.log('User started typing, exiting voice mode');
        setIsVoiceMode(false);
        if (isListening) {
          stopSpeechRecognition();
          setIsListening(false);
        }
      }
    };

    inputRef.current?.addEventListener('keydown', handleKeyDown);
    return () => inputRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceMode, isListening, stopSpeechRecognition, setIsVoiceMode]);

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="max-w-4xl mx-auto flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          disabled={isProcessing}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={toggleSpeech}
          className={`p-3 rounded-lg ${
            isListening ? 'bg-red-500' : 'bg-sky-500'
          } text-white`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
          disabled={isProcessing}
        >
          {isListening ? (
            <StopIcon className="h-5 w-5" />
          ) : (
            <MicrophoneIcon className="h-5 w-5" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isProcessing || !userInput.trim()}
          className={`p-3 rounded-lg bg-sky-500 text-white ${
            isProcessing || !userInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-600'
          }`}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </form>
  );
}