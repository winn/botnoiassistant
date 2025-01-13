import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function SystemPromptModal({ 
  isOpen, 
  onClose, 
  botCharacter,
  setBotCharacter,
  botActions,
  setBotActions,
  onSave,
  tools = [] 
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ botCharacter, botActions });
    onClose();
    toast.success('System prompt updated successfully');
  };

  const handleReset = () => {
    setBotCharacter('เป็นเพื่อนผู้หญิงน่ารัก คอยช่วยเหลือ ใจดี');
    setBotActions('ให้ตอบสั้น ๆ เหมือนคุยกับเพื่อน ให้พูดไพเราะ ลงท้ายด้วยค่ะ แทนตัวเองว่า เอวา');
    toast.success('Reset to default values');
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
              className="bg-white rounded-lg shadow-xl w-full max-w-5xl relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">System Prompt</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure the AI assistant's personality and behavior</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Bot Character Section */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-lg font-medium text-gray-800 mb-2">
                        Bot Character
                      </label>
                      <p className="text-sm text-gray-500">
                        Define the personality traits and characteristics of your AI assistant
                      </p>
                    </div>
                    <textarea
                      value={botCharacter}
                      onChange={(e) => setBotCharacter(e.target.value)}
                      className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                      rows="4"
                      placeholder="Example: A friendly and helpful female assistant who is kind and supportive"
                    />
                  </div>

                  {/* Bot Actions Section */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-lg font-medium text-gray-800 mb-2">
                        Bot Actions
                      </label>
                      <p className="text-sm text-gray-500">
                        Specify how the assistant should behave and respond to user inputs
                      </p>
                    </div>
                    <textarea
                      value={botActions}
                      onChange={(e) => setBotActions(e.target.value)}
                      className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                      rows="4"
                      placeholder="Example: Respond concisely, use polite language, end messages with ค่ะ, refer to self as เอวา"
                    />
                  </div>

                  {/* Available Tools Section */}
                  {tools.length > 0 && (
                    <div>
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          Available Tools
                        </h3>
                        <p className="text-sm text-gray-500">
                          The assistant has access to these tools and can use them when appropriate
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {tools.map((tool, index) => (
                          <div key={tool.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                            <h4 className="font-medium text-gray-700 mb-1">{tool.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Input: </span>
                                <span className="text-gray-700">{tool.input.description}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Output: </span>
                                <span className="text-gray-700">{tool.output.description}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center space-x-4 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Reset to Default
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}