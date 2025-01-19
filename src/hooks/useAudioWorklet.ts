import { useEffect, useCallback, useRef } from 'react';
import { useErrorTracking } from './useErrorTracking';
import { useMemoryLeakPrevention } from './useMemoryLeakPrevention';

interface AudioWorkletOptions {
  processorPath: string;
  onProcessorError?: (error: Error) => void;
  onAudioData?: (data: Float32Array) => void;
}

export function useAudioWorklet({
  processorPath,
  onProcessorError,
  onAudioData
}: AudioWorkletOptions) {
  const contextRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<AudioWorkletNode | null>(null);
  const { handleError } = useErrorTracking('AudioWorklet');
  const { isMounted } = useMemoryLeakPrevention('AudioWorklet');

  // Initialize audio context and worklet
  useEffect(() => {
    const initWorklet = async () => {
      try {
        contextRef.current = new AudioContext();
        await contextRef.current.audioWorklet.addModule(processorPath);

        const node = new AudioWorkletNode(contextRef.current, 'audio-processor');
        nodeRef.current = node;

        node.port.onmessage = (event) => {
          if (!isMounted()) return;
          if (event.data.error) {
            const error = new Error(event.data.error);
            handleError(error);
            onProcessorError?.(error);
          } else if (event.data.audioData) {
            onAudioData?.(event.data.audioData);
          }
        };

        node.connect(contextRef.current.destination);
      } catch (error) {
        handleError(error as Error);
      }
    };

    initWorklet();

    return () => {
      if (nodeRef.current) {
        nodeRef.current.disconnect();
        nodeRef.current = null;
      }
      if (contextRef.current) {
        contextRef.current.close();
        contextRef.current = null;
      }
    };
  }, [processorPath, isMounted, onProcessorError, onAudioData, handleError]);

  const processAudio = useCallback(async (audioData: ArrayBuffer) => {
    if (!contextRef.current || !nodeRef.current) {
      handleError(new Error('Audio worklet not initialized'));
      return;
    }

    try {
      const audioBuffer = await contextRef.current.decodeAudioData(audioData);
      nodeRef.current.port.postMessage({ audioBuffer });
    } catch (error) {
      handleError(error as Error);
    }
  }, [handleError]);

  return {
    processAudio,
    context: contextRef.current,
    node: nodeRef.current
  };
}