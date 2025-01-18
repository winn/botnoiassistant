import React, { useState, useRef, useEffect } from 'react';
import { Cog6ToothIcon, CloudIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { saveCredential } from '../services/storage';
import { toast } from 'react-hot-toast';

export default function TopMenu({ 
  apiKey, 
  setApiKey, 
  useSupabase, 
  setUseSupabase,
  botnoiToken,
  setBotnoiToken
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApiKeyChange = async (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    
    if (newApiKey) {
      const saved = await saveCredential('openai', newApiKey);
      if (saved) {
        toast.success('API key saved successfully');
      }
    }
  };

  const handleBotnoiTokenChange = async (e) => {
    const newToken = e.target.value;
    setBotnoiToken(newToken);
    
    if (newToken) {
      const saved = await saveCredential('botnoi', newToken);
      if (saved) {
        toast.success('Botnoi token saved successfully');
      }
    }
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  placeholder="Enter your OpenAI API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Botnoi Voice Token
                </label>
                <input
                  type="password"
                  value={botnoiToken}
                  onChange={handleBotnoiTokenChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  placeholder="Enter your Botnoi Voice token"
                />
              </div>
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Store Conversations</span>
                  <div 
                    onClick={() => setUseSupabase(!useSupabase)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      useSupabase ? 'bg-sky-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">Store conversations in cloud</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useSupabase ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </label>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <CloudIcon className="h-4 w-4 mr-1" />
                  {useSupabase ? 'Storing conversations in cloud' : 'Keeping conversations in browser only'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}