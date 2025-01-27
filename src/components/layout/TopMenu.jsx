import React, { useState, useRef, useEffect } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-hot-toast';

export default function TopMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const {
    apiKey,
    setApiKey,
    botnoiToken,
    setBotnoiToken,
    speechRecognitionEnabled,
    setSpeechRecognitionEnabled,
    textToSpeechEnabled,
    setTextToSpeechEnabled
  } = useSettings();

  // Local state for form values
  const [formValues, setFormValues] = useState({
    apiKey: apiKey,
    botnoiToken: botnoiToken
  });

  // Update local state when props change
  useEffect(() => {
    setFormValues({
      apiKey: apiKey,
      botnoiToken: botnoiToken
    });
  }, [apiKey, botnoiToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveApiKey = () => {
    setApiKey(formValues.apiKey);
    toast.success('OpenAI API key saved successfully');
  };

  const handleSaveBotnoiToken = () => {
    setBotnoiToken(formValues.botnoiToken);
    toast.success('Botnoi token saved successfully');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-sky-100 text-sky-500 transition-colors"
      >
        <Cog6ToothIcon className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 z-50"
          >
            <div className="space-y-4">
              {/* Voice Features */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Voice Features</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Speech Recognition</span>
                  <button
                    onClick={() => setSpeechRecognitionEnabled(!speechRecognitionEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      speechRecognitionEnabled ? 'bg-sky-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">Enable speech recognition</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        speechRecognitionEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Text to Speech</span>
                  <button
                    onClick={() => setTextToSpeechEnabled(!textToSpeechEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      textToSpeechEnabled ? 'bg-sky-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">Enable text to speech</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        textToSpeechEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={formValues.apiKey}
                    onChange={(e) => setFormValues(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    placeholder="Enter your OpenAI API key"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              {textToSpeechEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Botnoi Voice Token
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={formValues.botnoiToken}
                      onChange={(e) => setFormValues(prev => ({ ...prev, botnoiToken: e.target.value }))}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Enter your Botnoi Voice token"
                    />
                    <button
                      onClick={handleSaveBotnoiToken}
                      className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}