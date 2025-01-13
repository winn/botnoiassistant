import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AgentModal({ 
  isOpen, 
  onClose, 
  onSave,
  agent = null,
  tools = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    character: '',
    actions: '',
    enabledTools: []
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        character: agent.character,
        actions: agent.actions,
        enabledTools: agent.enabledTools || []
      });
    } else {
      setFormData({
        name: '',
        character: 'เป็นเพื่อนผู้หญิงน่ารัก คอยช่วยเหลือ ใจดี',
        actions: 'ให้ตอบสั้น ๆ เหมือนคุยกับเพื่อน ให้พูดไพเราะ ลงท้ายด้วยค่ะ แทนตัวเองว่า เอวา',
        enabledTools: []
      });
    }
  }, [agent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    onSave(formData);
    onClose();
    toast.success(agent ? 'Agent updated successfully' : 'Agent added successfully');
  };

  const toggleTool = (toolId) => {
    setFormData(prev => ({
      ...prev,
      enabledTools: prev.enabledTools.includes(toolId)
        ? prev.enabledTools.filter(id => id !== toolId)
        : [...prev.enabledTools, toolId]
    }));
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
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {agent ? 'Edit Agent' : 'Add New Agent'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter agent name"
                  />
                </div>

                {/* Character */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character Description
                  </label>
                  <textarea
                    value={formData.character}
                    onChange={(e) => setFormData({ ...formData, character: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    rows="3"
                    placeholder="Describe the agent's personality"
                  />
                </div>

                {/* Actions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Behavior Instructions
                  </label>
                  <textarea
                    value={formData.actions}
                    onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    rows="3"
                    placeholder="Define how the agent should behave"
                  />
                </div>

                {/* Available Tools */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Tools
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                    {tools.map(tool => (
                      <div
                        key={tool.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          id={`tool-${tool.id}`}
                          checked={formData.enabledTools.includes(tool.id)}
                          onChange={() => toggleTool(tool.id)}
                          className="h-4 w-4 text-sky-500 rounded border-gray-300 focus:ring-sky-500"
                        />
                        <label
                          htmlFor={`tool-${tool.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-gray-700">{tool.name}</div>
                          <div className="text-sm text-gray-500">{tool.description}</div>
                        </label>
                      </div>
                    ))}
                    {tools.length === 0 && (
                      <div className="text-gray-500 text-center py-4">
                        No tools available. Add tools in the Tools section.
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    {agent ? 'Update Agent' : 'Add Agent'}
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