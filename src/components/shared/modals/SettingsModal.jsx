import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useFeatureFlags } from '../../../contexts/FeaturesContext';
import ModalWrapper from './ModalWrapper';
import ModalHeader from './ModalHeader';
import Switch from '../forms/Switch';

export default function SettingsModal({ isOpen, onClose }) {
  const { features, toggleFeature } = useFeatureFlags();

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        <ModalHeader title="Settings" onClose={onClose} />
        
        <div className="p-6 space-y-6">
          {/* Voice Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Voice Features</h3>
            <Switch
              label="Enable Voice Input/Output"
              checked={features.voice.enabled}
              onChange={(checked) => toggleFeature('voice.enabled', checked)}
            />
            {features.voice.enabled && (
              <>
                <Switch
                  label="Voice Recognition"
                  checked={features.voice.recognition.enabled}
                  onChange={(checked) => toggleFeature('voice.recognition.enabled', checked)}
                />
                <Switch
                  label="Voice Synthesis"
                  checked={features.voice.synthesis.enabled}
                  onChange={(checked) => toggleFeature('voice.synthesis.enabled', checked)}
                />
              </>
            )}
          </div>

          {/* Chat Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Chat Features</h3>
            <Switch
              label="Enable Streaming"
              checked={features.chat.streaming}
              onChange={(checked) => toggleFeature('chat.streaming', checked)}
            />
            <Switch
              label="Show Debug Information"
              checked={features.chat.debug}
              onChange={(checked) => toggleFeature('chat.debug', checked)}
            />
          </div>

          {/* UI Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">UI Features</h3>
            <Switch
              label="Enable Animations"
              checked={features.ui.animations}
              onChange={(checked) => toggleFeature('ui.animations', checked)}
            />
            <Switch
              label="Hide Voice Features on Mobile"
              checked={features.ui.responsiveVoice}
              onChange={(checked) => toggleFeature('ui.responsiveVoice', checked)}
            />
          </div>
        </div>
      </motion.div>
    </ModalWrapper>
  );
}