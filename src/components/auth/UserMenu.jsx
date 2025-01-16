import React, { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function UserMenu({ user, onLoginClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error(error.message);
    }
    setIsOpen(false);
  };

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
      >
        Login
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <UserCircleIcon className="h-6 w-6 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {user.user_metadata.username || user.email}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
          >
            <div className="px-4 py-2 border-b">
              <div className="text-sm font-medium text-gray-900">
                {user.user_metadata.full_name}
              </div>
              <div className="text-sm text-gray-500">
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}