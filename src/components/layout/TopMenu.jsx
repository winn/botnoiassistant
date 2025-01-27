import React, { useState, useRef, useEffect } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';

export default function TopMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const {
    openaiKey,
    setOpenaiKey,
    claudeKey,
    setClaudeKey,
    geminiKey,
    setGeminiKey,
    botnoiToken,
    setBotnoiToken,
    speechRecognitionEnabled,
    setSpeechRecognitionEnabled,
    textToSpeechEnabled,
    setTextToSpeechEnabled
  } = useSettings();

  // Local state for form values
  const [formValues, setFormValues] = useState({
    openaiKey: openaiKey,
    claudeKey: claudeKey,
    geminiKey: geminiKey,
    botnoiToken: botnoiToken
  });

  // Update local state when props change
  useEffect(() => {
    setFormValues({
      openaiKey: openaiKey,
      claudeKey: claudeKey,
      geminiKey: geminiKey,
      botnoiToken: botnoiToken
    });
  }, [openaiKey, claudeKey, geminiKey, botnoiToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveOpenAIKey = async () => {
    await setOpenaiKey(formValues.openaiKey);
  };

  const handleSaveClaudeKey = async () => {
    await setClaudeKey(formValues.claudeKey);
  };

  const handleSaveGeminiKey = async () => {
    await setGeminiKey(formValues.geminiKey);
  };

  const handleSaveBotnoiToken = async () => {
    await setBotnoiToken(formValues.botnoiToken);
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

              {/* API Keys */}
              <div className="space-y-4 border-t pt-4">
                {/* OpenAI API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={formValues.openaiKey}
                      onChange={(e) => setFormValues(prev => ({ ...prev, openaiKey: e.target.value }))}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Enter your OpenAI API key"
                    />
                    <button
                      onClick={handleSaveOpenAIKey}
                      className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Claude API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claude API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={formValues.claudeKey}
                      onChange={(e) => setFormValues(prev => ({ ...prev, claudeKey: e.target.value }))}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Enter your Claude API key"
                    />
                    <button
                      onClick={handleSaveClaudeKey}
                      className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Gemini API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={formValues.geminiKey}
                      onChange={(e) => setFormValues(prev => ({ ...prev, geminiKey: e.target.value }))}
                      className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Enter your Gemini API key"
                    />
                    <button
                      onClick={handleSaveGeminiKey}
                      className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Botnoi Token (only shown if text-to-speech is enabled) */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}