import { useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';

// Helper function to detect iOS
const isIOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

export function useAudio({ onPlaybackComplete }) {
  const audioRef = useRef(null);
  const { botnoiToken, isSpeakerOn } = useSettings();
  const isIosDevice = isIOS();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playAudio = async (text) => {
    if (isIosDevice) {
      console.log('TTS disabled on iOS devices');
      onPlaybackComplete?.();
      return false;
    }

    if (!isSpeakerOn) {
      console.log('Speaker is off, skipping TTS');
      onPlaybackComplete?.();
      return false;
    }

    console.log('Starting TTS with text:', text);
    
    if (!botnoiToken) {
      console.error('Missing Botnoi token');
      toast.error('Please enter your Botnoi Voice token in settings');
      onPlaybackComplete?.();
      return false;
    }

    if (!text?.trim()) {
      console.error('Empty text provided to TTS');
      toast.error('No text to convert to speech');
      onPlaybackComplete?.();
      return false;
    }

    try {
      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const response = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
        method: 'POST',
        headers: {
          'Botnoi-Token': botnoiToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim(),
          speaker: "1",
          volume: 1,
          speed: 1,
          type_media: "mp3",
          save_file: true,
          language: "th"
        })
      });

      const responseData = await response.json();
      console.log('TTS API response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `API request failed with status ${response.status}`);
      }

      if (!responseData.audio_url) {
        throw new Error('No audio URL in API response');
      }

      const audio = new Audio(responseData.audio_url);
      audioRef.current = audio;

      // Add error handling for audio loading
      audio.onerror = (e) => {
        console.error('Audio loading error:', e);
        toast.error('Failed to load audio file');
        onPlaybackComplete?.();
      };

      // Add event listeners before playing
      const handleEnded = () => {
        console.log('Audio playback completed');
        onPlaybackComplete?.();
      };

      const handleError = (e) => {
        console.error('Audio playback error:', e);
        toast.error('Audio playback failed');
        onPlaybackComplete?.();
      };

      audio.addEventListener('ended', handleEnded, { once: true });
      audio.addEventListener('error', handleError, { once: true });

      // Start playback
      await audio.play();
      return true;

    } catch (error) {
      console.error('TTS Error:', error.message || error);
      let errorMessage = 'Failed to generate speech';
      
      if (error.message?.includes('401')) {
        errorMessage = 'Invalid Botnoi Voice token';
      } else if (error.message?.includes('429')) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      onPlaybackComplete?.();
      return false;
    }
  };

  return { playAudio };
}