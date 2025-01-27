import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { loadUserProfile, loadAgents, loadTools, loadCredential } from '../../services/storage';
import { useSettings } from '../../contexts/SettingsContext';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const { setOpenaiKey, setClaudeKey, setGeminiKey, setBotnoiToken } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        // Load user data in parallel
        const [profile, agents, tools, openaiKey, claudeKey, geminiKey, botnoiToken] = await Promise.all([
          loadUserProfile(),
          loadAgents(),
          loadTools(),
          loadCredential('openai'),
          loadCredential('claude'),
          loadCredential('gemini'),
          loadCredential('botnoi')
        ]);

        // Set credentials in settings context
        if (openaiKey) await setOpenaiKey(openaiKey);
        if (claudeKey) await setClaudeKey(claudeKey);
        if (geminiKey) await setGeminiKey(geminiKey);
        if (botnoiToken) await setBotnoiToken(botnoiToken);

        onLoginSuccess?.({ 
          user: data.user,
          profile, 
          agents, 
          tools,
          credentials: { openaiKey, claudeKey, geminiKey, botnoiToken }
        });
        toast.success('Successfully logged in!');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              full_name: formData.fullName,
            }
          }
        });
        if (error) throw error;
        toast.success('Successfully signed up! Please check your email for verification.');
      }
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#262626] bg-opacity-25"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#ffffff] rounded-lg shadow-xl w-full max-w-md relative z-10"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-[#262626]">
                    {isLogin ? 'Login' : 'Sign Up'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-[#01BFFB]/10 text-[#262626] rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#262626] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#01BFFB] focus:border-[#01BFFB] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#262626] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#01BFFB] focus:border-[#01BFFB] transition-all"
                      required
                    />
                  </div>

                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#262626] mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#01BFFB] focus:border-[#01BFFB] transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#262626] mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#01BFFB] focus:border-[#01BFFB] transition-all"
                          required
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg text-[#ffffff] ${
                      loading
                        ? 'bg-[#262626] cursor-not-allowed opacity-50'
                        : 'bg-[#01BFFB] hover:opacity-90'
                    } transition-all`}
                  >
                    {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-[#01BFFB] hover:opacity-90 transition-colors"
                    >
                      {isLogin
                        ? "Don't have an account? Sign up"
                        : 'Already have an account? Login'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}