import { useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export function useSpeechRecognition({ onTranscriptChange, onSpeechEnd }) {
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpeechRef = useRef(Date.now());
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  const checkSilence = () => {
    const now = Date.now();
    const timeSinceLastSpeech = now - lastSpeechRef.current;
    console.log('Checking silence, time since last speech:', timeSinceLastSpeech);

    if (timeSinceLastSpeech > 2000 && finalTranscriptRef.current.trim()) {
      console.log('Silence detected with transcript:', finalTranscriptRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        const transcript = finalTranscriptRef.current.trim();
        onSpeechEnd?.(transcript);
      }
    } else if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(checkSilence, 500);
    }
  };

  const startSpeechRecognition = () => {
    console.log('Starting speech recognition');
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    // Cleanup previous instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          lastSpeechRef.current = Date.now();
          console.log('Final transcript:', finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current = finalTranscript;
        onTranscriptChange?.(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => {
    console.log('Stopping speech recognition');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  };

  return {
    startSpeechRecognition,
    stopSpeechRecognition
  };
}