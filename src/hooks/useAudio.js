import { useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';

export function useAudio({ lastInputMode, onPlaybackComplete }) {
  const audioRef = useRef(null);
  const audioEndedCallbackRef = useRef(null);
  const { botnoiToken } = useSettings();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioEndedCallbackRef.current) {
          audioRef.current.removeEventListener('ended', audioEndedCallbackRef.current);
        }
      }
    };
  }, []);

  const playAudio = async (text) => {
    console.log('Starting TTS with text:', text);
    if (!botnoiToken) {
      toast.error('Please enter your Botnoi Voice token in settings');
      return false;
    }

    try {
      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioEndedCallbackRef.current) {
          audioRef.current.removeEventListener('ended', audioEndedCallbackRef.current);
        }
      }

      const response = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
        method: 'POST',
        headers: {
          'Botnoi-Token': botnoiToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          speaker: "1",
          volume: 1,
          speed: 1,
          type_media: "mp3",
          save_file: true,
          language: "th"
        })
      });

      const result = await response.json();
      console.log('TTS API response:', result);

      if (result.audio_url) {
        const audio = new Audio(result.audio_url);
        audioRef.current = audio;

        // Create and store the callback
        const onEnded = () => {
          console.log('Audio playback completed');
          onPlaybackComplete?.();
        };
        audioEndedCallbackRef.current = onEnded;

        // Add event listener
        audio.addEventListener('ended', onEnded);

        // Start playback
        console.log('Starting audio playback...');
        await audio.play();
        return true; // Audio is playing
      } else {
        throw new Error('Failed to get audio URL');
      }
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error('Failed to generate speech');
      onPlaybackComplete?.();
      return false; // Audio failed to play
    }
  };

  return { playAudio };
}