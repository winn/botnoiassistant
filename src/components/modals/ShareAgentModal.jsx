import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ShareAgentModal({ isOpen, onClose, agent }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  // Fetch latest agent status when modal opens
  useEffect(() => {
    async function fetchAgentStatus() {
      if (!agent?.id || !isOpen) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('agents')
          .select('is_public')
          .eq('id', agent.id)
          .single();

        if (error) throw error;
        setIsPublic(data.is_public || false);
      } catch (error) {
        console.error('Error fetching agent status:', error);
        toast.error('Failed to load sharing status');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgentStatus();
  }, [agent?.id, isOpen]);

  const handleShareToggle = async () => {
    if (!agent) return;

    try {
      setIsUpdating(true);
      const newIsPublic = !isPublic;

      const { error } = await supabase
        .from('agents')
        .update({ is_public: newIsPublic })
        .eq('id', agent.id);

      if (error) throw error;

      setIsPublic(newIsPublic);
      toast.success(newIsPublic ? 'Agent is now public' : 'Agent is now private');
    } catch (error) {
      console.error('Error toggling share:', error);
      toast.error(error.message || 'Failed to update sharing settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const shareUrl = `${window.location.origin}/#/shared/${agent.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Share Agent</h3>
                    <p className="text-sm text-gray-500 mt-1">{agent?.name}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {isLoading ? (
                  <div className="py-8">
                    <LoadingSpinner className="mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Warning Message */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        When sharing is enabled, anyone with the link can use this agent.
                        Make sure you trust the content and behavior of this agent.
                      </p>
                    </div>

                    {/* Share Toggle */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="text-base font-medium text-gray-900">Make Public</h4>
                          <p className="text-sm text-gray-500">Allow others to use this agent</p>
                        </div>
                        <button
                          onClick={handleShareToggle}
                          disabled={isUpdating}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isUpdating ? 'cursor-not-allowed opacity-50' : ''
                          } ${isPublic ? 'bg-sky-500' : 'bg-gray-200'}`}
                        >
                          <span className="sr-only">Enable sharing</span>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isPublic ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Share Link */}
                    {isPublic && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Share Link
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={`${window.location.origin}/#/shared/${agent.id}`}
                            readOnly
                            className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
                          />
                          <button
                            onClick={copyToClipboard}
                            className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}