import { useState, useCallback, useRef, useEffect } from 'react';
import { useErrorTracking } from './useErrorTracking';
import { useMemoryLeakPrevention } from './useMemoryLeakPrevention';

interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
}

export function useVoiceRecognition({
  language = 'th-TH',
  continuous = true,
  interimResults = true,
  maxAlternatives = 1,
  onResult,
  onError,
  onEnd
}: VoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { handleError } = useErrorTracking('VoiceRecognition');
  const { isMounted } = useMemoryLeakPrevention('VoiceRecognition');

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      handleError(new Error('Speech recognition not supported'));
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language;
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.maxAlternatives = maxAlternatives;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, handleError]);

  // Set up recognition event handlers
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event: any) => {
      if (!isMounted()) return;

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      onResult?.(currentTranscript, Boolean(finalTranscript));
    };

    recognitionRef.current.onerror = (event: any) => {
      if (!isMounted()) return;
      const error = new Error(event.error);
      handleError(error);
      onError?.(error);
    };

    recognitionRef.current.onend = () => {
      if (!isMounted()) return;
      setIsListening(false);
      onEnd?.();
    };
  }, [isMounted, onResult, onError, onEnd, handleError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      handleError(new Error('Speech recognition not initialized'));
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      handleError(error as Error);
    }
  }, [handleError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      handleError(error as Error);
    }
  }, [handleError]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening
  };
}