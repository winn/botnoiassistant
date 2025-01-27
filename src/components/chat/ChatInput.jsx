import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSettings } from '../../contexts/SettingsContext';

export default function ChatInput({ onSubmit, disabled, isSpeaking }) {
  const [input, setInput] = useState('');
  const [wasUsingVoice, setWasUsingVoice] = useState(false);
  const { speechRecognitionEnabled } = useSettings();
  const inputRef = useRef(null);
  
  const { isListening, startSpeechRecognition, stopSpeechRecognition } = useSpeechRecognition({
    onTranscriptChange: (transcript) => {
      setInput(transcript);
    },
    onSpeechEnd: (finalTranscript) => {
      if (finalTranscript.trim()) {
        stopSpeechRecognition();
        onSubmit(finalTranscript.trim());
        setInput('');
        setWasUsingVoice(true);
        // Focus after speech recognition ends
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  });

  // Auto-restart mic after speaking if we were using voice
  useEffect(() => {
    if (!isSpeaking && !isListening && !disabled && wasUsingVoice && speechRecognitionEnabled) {
      startSpeechRecognition();
    }
  }, [isSpeaking, isListening, disabled, wasUsingVoice, speechRecognitionEnabled, startSpeechRecognition]);

  // Focus input when disabled state changes to false
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      stopSpeechRecognition();
      onSubmit(input.trim());
      setInput('');
      setWasUsingVoice(false);
      // Focus back on input after sending with a small delay
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleInputChange = (e) => {
    if (isListening) {
      stopSpeechRecognition();
      setWasUsingVoice(false);
    }
    setInput(e.target.value);
  };

  const handleVoiceButton = () => {
    if (isListening) {
      stopSpeechRecognition();
      setWasUsingVoice(false);
      // Focus back on input when stopping voice
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setInput('');
      startSpeechRecognition();
      setWasUsingVoice(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-center space-x-2 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="w-full p-3 pr-12 bg-white/60 backdrop-blur border border-white/20 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-lg"
            disabled={disabled}
            autoFocus
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
              disabled || !input.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        {speechRecognitionEnabled && (
          <button
            type="button"
            onClick={handleVoiceButton}
            disabled={disabled || isSpeaking}
            className={`p-3 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/60 backdrop-blur border border-white/20 hover:bg-sky-50 text-sky-500'
            } shadow-lg ${(disabled || isSpeaking) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? (
              <StopIcon className="h-5 w-5" />
            ) : (
              <MicrophoneIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </form>
  );
}