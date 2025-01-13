import React, { useState, useRef, useEffect } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopMenu({ 
  apiKey, 
  setApiKey, 
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
                  onChange={(e) => setApiKey(e.target.value)}
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
                  onChange={(e) => setBotnoiToken(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  placeholder="Enter your Botnoi Voice token"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}