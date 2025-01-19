import React from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import IconButton from '../../shared/buttons/icons/IconButton';
import { useFeatureFlags } from '../../../contexts/FeaturesContext';

export default function VoiceButton({
  isListening,
  onStart,
  onStop,
  disabled
}) {
  const { isEnabled } = useFeatureFlags();
  
  // Don't render if voice features are disabled
  if (!isEnabled('voice.enabled') || !isEnabled('voice.recognition.enabled')) {
    return null;
  }

  // Don't render on mobile if responsive voice is enabled
  if (isEnabled('ui.responsiveVoice') && window.innerWidth < 640) {
    return null;
  }

  return (
    <IconButton
      icon={isListening ? StopIcon : MicrophoneIcon}
      onClick={isListening ? onStop : onStart}
      className={isListening ? 'bg-red-500 text-white' : 'text-sky-500'}
      label={isListening ? 'Stop listening' : 'Start voice input'}
      disabled={disabled}
    />
  );
}