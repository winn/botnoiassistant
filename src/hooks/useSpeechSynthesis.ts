import { useState, useCallback, useRef } from 'react';
import { useErrorTracking } from './useErrorTracking';
import { useMemoryLeakPrevention } from './useMemoryLeakPrevention';

interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice;
  pitch?: number;
  rate?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useSpeechSynthesis({
  voice,
  pitch = 1,
  rate = 1,
  volume = 1,
  onStart,
  onEnd,
  onError
}: SpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { handleError } = useErrorTracking('SpeechSynthesis');
  const { isMounted } = useMemoryLeakPrevention('SpeechSynthesis');

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      handleError(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure utterance
    utterance.voice = voice || null;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    // Set up event handlers
    utterance.onstart = () => {
      if (!isMounted()) return;
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      if (!isMounted()) return;
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      if (!isMounted()) return;
      const error = new Error(event.error);
      handleError(error);
      onError?.(error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [voice, pitch, rate, volume, isMounted, onStart, onEnd, onError, handleError]);

  const pause = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const cancel = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  return {
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    cancel
  };
}