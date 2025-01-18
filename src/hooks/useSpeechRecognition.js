import { useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const SILENCE_TIMEOUT = 2000; // 2 seconds of silence before auto-submitting

export function useSpeechRecognition({ onTranscriptChange, onSpeechEnd }) {
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpeechRef = useRef(Date.now());
  const finalTranscriptRef = useRef('');

  const stopSpeechRecognition = useCallback(() => {
    console.log('Stopping speech recognition');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  const submitTranscript = useCallback(() => {
    const transcript = finalTranscriptRef.current.trim();
    if (transcript) {
      console.log('Submitting final transcript:', transcript);
      stopSpeechRecognition();
      onSpeechEnd?.(transcript);
      finalTranscriptRef.current = ''; // Clear transcript after submission
    }
  }, [onSpeechEnd, stopSpeechRecognition]);

  const checkSilence = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSpeech = now - lastSpeechRef.current;
    console.log('Checking silence, time since last speech:', timeSinceLastSpeech);

    if (timeSinceLastSpeech > SILENCE_TIMEOUT && finalTranscriptRef.current.trim()) {
      console.log('Silence detected with final transcript:', finalTranscriptRef.current);
      submitTranscript();
    } else if (recognitionRef.current) {
      silenceTimeoutRef.current = setTimeout(checkSilence, 500);
    }
  }, [submitTranscript]);

  const startSpeechRecognition = useCallback(() => {
    console.log('Starting speech recognition');
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    // Don't start if already running
    if (recognitionRef.current) {
      console.log('Speech recognition already running');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'th-TH';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      finalTranscriptRef.current = '';
      lastSpeechRef.current = Date.now();
      silenceTimeoutRef.current = setTimeout(checkSilence, 500);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          lastSpeechRef.current = Date.now();
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Update final transcript if we have new final results
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        console.log('New final transcript:', finalTranscriptRef.current);
      }

      // Update display with both final and interim
      const displayText = finalTranscriptRef.current + interimTranscript;
      console.log('Updating display text:', displayText);
      onTranscriptChange?.(displayText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      stopSpeechRecognition();
    };

    recognition.onend = () => {
      console.log('Speech recognition ended naturally');
      stopSpeechRecognition();
      if (finalTranscriptRef.current.trim()) {
        submitTranscript();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [checkSilence, onTranscriptChange, stopSpeechRecognition, submitTranscript]);

  useEffect(() => {
    return () => {
      stopSpeechRecognition();
    };
  }, [stopSpeechRecognition]);

  return {
    startSpeechRecognition,
    stopSpeechRecognition
  };
}