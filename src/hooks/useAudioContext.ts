import { useRef, useEffect, useCallback } from 'react';

interface AudioContextOptions {
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useAudioContext(options: AudioContextOptions = {}) {
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    contextRef.current = new AudioContext();
    return () => {
      contextRef.current?.close();
    };
  }, []);

  const playAudio = useCallback(async (audioData: ArrayBuffer) => {
    if (!contextRef.current) return;

    try {
      // Stop any currently playing audio
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }

      // Create new source
      const source = contextRef.current.createBufferSource();
      sourceRef.current = source;

      // Decode and play audio
      const audioBuffer = await contextRef.current.decodeAudioData(audioData);
      source.buffer = audioBuffer;
      source.connect(contextRef.current.destination);

      source.onended = () => {
        options.onComplete?.();
        source.disconnect();
      };

      source.start(0);
    } catch (error) {
      options.onError?.(error as Error);
    }
  }, [options]);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  }, []);

  return {
    playAudio,
    stopAudio,
    context: contextRef.current
  };
}