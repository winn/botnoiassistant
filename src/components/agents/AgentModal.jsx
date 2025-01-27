import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AgentModal({ isOpen, onClose, onSave, agent = null, tools = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    llm_engine: 'gpt-4',
    greeting: '',
    character: '',
    actions: '',
    enabled_tools: [],
    faqs: []
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        id: agent.id,
        name: agent.name || '',
        llm_engine: agent.llm_engine || 'gpt-4',
        greeting: agent.greeting || '',
        character: agent.character || '',
        actions: agent.actions || '',
        enabled_tools: agent.enabled_tools || [],
        faqs: agent.faqs || [],
        isDefault: agent.isDefault || false
      });
    } else {
      setFormData({
        name: '',
        llm_engine: 'gpt-4',
        greeting: 'Hello! I\'m here to help you. How can I assist you today?',
        character: 'Eva is a friendly, knowledgeable, and patient AI assistant designed to help users navigate the AI builder platform. It uses simple, conversational language to make users feel comfortable and provides step-by-step guidance without overwhelming them. Aiden is proactive, offering tips and encouragement to keep users motivated. Its goal is to make building and sharing AI agents effortless and enjoyable.',
        actions: 'Be Approachable: Use warm, conversational language and avoid technical jargon.\n\nProvide Clear Guidance: Break down tasks into simple, actionable steps.\n\nAnticipate Needs: Offer suggestions and tips before users ask for help.\n\nCelebrate Progress: Acknowledge user achievements and encourage exploration of new features.',
        enabled_tools: [],
        faqs: []
      });
    }
  }, [agent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    if (!formData.llm_engine) {
      toast.error('Please select an LLM engine');
      return;
    }

    if (!formData.greeting?.trim()) {
      toast.error('Please enter a greeting message');
      return;
    }

    if (!formData.character?.trim()) {
      toast.error('Please enter a character description');
      return;
    }

    if (!formData.actions?.trim()) {
      toast.error('Please enter behavior instructions');
      return;
    }

    try {
      await onSave(formData);
      onClose();
      toast.success(agent ? 'Agent updated successfully' : 'Agent created successfully');
    } catch (error) {
      toast.error('Failed to save agent');
    }
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '', id: crypto.randomUUID() }]
    }));
  };

  const updateFaq = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map(faq => 
        faq.id === id ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const removeFaq = (id) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(faq => faq.id !== id)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
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
            className="fixed inset-0 w-screen h-screen bg-white shadow-2xl z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b">
              <div>
                <h2 className="text-2xl font-semibold">
                  {formData.isDefault ? 'View Default Agent' : (agent ? 'Edit Agent' : 'Add New Agent')}
                </h2>
                <p className="text-gray-500 mt-1">Configure your AI assistant's personality and behavior</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form id="agent-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto w-full">
              <div className="w-full mx-auto px-8 py-6 space-y-12">
                {/* Basic Info */}
                <div className="space-y-8">
                  <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Enter agent name"
                        disabled={formData.isDefault}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Give your agent a unique and descriptive name
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LLM Engine
                      </label>
                      <select
                        value={formData.llm_engine}
                        onChange={(e) => setFormData({ ...formData, llm_engine: e.target.value })}
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        disabled={formData.isDefault}
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="claude">Claude</option>
                        <option value="gemini">Gemini</option>
                      </select>
                      <p className="mt-2 text-sm text-gray-500">
                        Select the language model that powers your agent
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Greeting Message
                      </label>
                      <input
                        type="text"
                        value={formData.greeting}
                        onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Enter greeting message"
                        disabled={formData.isDefault}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        The first message users will see when they start a conversation
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Character Description
                      </label>
                      <textarea
                        value={formData.character}
                        onChange={(e) => setFormData({ ...formData, character: e.target.value })}
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        rows="12"
                        placeholder="Describe the agent's personality"
                        disabled={formData.isDefault}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Define the personality traits, characteristics, and role of your AI assistant. Be specific about their expertise, communication style, and how they should interact with users.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Behavior Instructions
                      </label>
                      <textarea
                        value={formData.actions}
                        onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        rows="12"
                        placeholder="Define how the agent should behave"
                        disabled={formData.isDefault}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Specify detailed instructions for how the assistant should behave and respond to user inputs. Include guidelines for tone, language style, response format, and any specific protocols they should follow.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tools Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Available Tools</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Select which tools this agent can use when responding to users
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                    {tools.map(tool => (
                      <div
                        key={tool.id}
                        className="flex items-start space-x-4 p-4 bg-white rounded-lg border hover:border-sky-200 transition-colors"
                      >
                        <div className="flex items-center h-5 pt-1">
                          <input
                            type="checkbox"
                            id={`tool-${tool.id}`}
                            checked={formData.enabled_tools.includes(tool.id)}
                            onChange={() => {
                              const newTools = formData.enabled_tools.includes(tool.id)
                                ? formData.enabled_tools.filter(id => id !== tool.id)
                                : [...formData.enabled_tools, tool.id];
                              setFormData({ ...formData, enabled_tools: newTools });
                            }}
                            className="h-4 w-4 text-sky-500 rounded border-gray-300 focus:ring-sky-500"
                            disabled={formData.isDefault}
                          />
                        </div>
                        <div className="flex-1">
                          <label
                            htmlFor={`tool-${tool.id}`}
                            className="block cursor-pointer"
                          >
                            <div className="font-medium text-gray-900">{tool.name}</div>
                            <div className="text-sm text-gray-600 mb-2">{tool.description}</div>
                          </label>

                          {formData.enabled_tools.includes(tool.id) && (
                            <div className="mt-4 bg-sky-50 p-4 rounded-lg">
                              <div className="space-y-3 text-sm">
                                <div>
                                  <span className="font-medium text-sky-900">Input Required:</span>
                                  <p className="text-sky-800 mt-1">{tool.input.description}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-sky-900">Output:</span>
                                  <p className="text-sky-800 mt-1">{tool.output.description}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {tools.length === 0 && (
                      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
                        <p className="text-gray-500">No tools available</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add tools in the Tools section first
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* FAQs Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Knowledge Base</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Add frequently asked questions to help your agent provide consistent responses
                      </p>
                    </div>
                    {!formData.isDefault && (
                      <button
                        type="button"
                        onClick={addFaq}
                        className="flex items-center space-x-2 px-4 py-2 text-sm bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Add FAQ</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-6">
                    {formData.faqs.map((faq, index) => (
                      <div key={faq.id} className="p-6 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-sm font-medium text-gray-500">FAQ #{index + 1}</span>
                          {!formData.isDefault && (
                            <button
                              type="button"
                              onClick={() => removeFaq(faq.id)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Question
                            </label>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                              placeholder="Enter question"
                              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              disabled={formData.isDefault}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Answer
                            </label>
                            <textarea
                              value={faq.answer}
                              onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                              placeholder="Enter answer"
                              rows="4"
                              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              disabled={formData.isDefault}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.faqs.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                        <p className="text-gray-500">No FAQs added yet</p>
                        {!formData.isDefault && (
                          <button
                            type="button"
                            onClick={addFaq}
                            className="mt-2 text-sky-500 hover:text-sky-600 text-sm font-medium"
                          >
                            Add your first FAQ
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex justify-end items-center space-x-4 px-8 py-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="min-w-[120px] h-12 px-8 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {formData.isDefault ? 'Close' : 'Cancel'}
              </button>
              {!formData.isDefault && (
                <button
                  type="submit"
                  form="agent-form"
                  className="min-w-[120px] h-12 px-8 text-base font-medium bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}