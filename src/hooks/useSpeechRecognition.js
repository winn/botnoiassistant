import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export function useSpeechRecognition({ onTranscriptChange, onSpeechEnd }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, []);

  const startSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    // Don't start if already running
    if (recognitionRef.current) {
      console.log('Speech recognition already running');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    
    newRecognition.continuous = false; // Changed to false to stop after each utterance
    newRecognition.interimResults = true;
    newRecognition.lang = 'th-TH';

    newRecognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    newRecognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update display with both final and interim
      const displayText = finalTranscript + interimTranscript;
      onTranscriptChange?.(displayText);

      // If we have a final transcript, submit it
      if (finalTranscript) {
        onSpeechEnd?.(finalTranscript);
      }
    };

    newRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Speech recognition error: ' + event.error);
      stopSpeechRecognition();
    };

    newRecognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = newRecognition;
    newRecognition.start();
  }, [onTranscriptChange, onSpeechEnd, stopSpeechRecognition]);

  return {
    isListening,
    startSpeechRecognition,
    stopSpeechRecognition
  };
}