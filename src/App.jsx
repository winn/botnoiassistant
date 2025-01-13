import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import Settings from './components/Settings';
import ChatHistory from './components/ChatHistory';
import TopMenu from './components/TopMenu';
import ToolModal from './components/ToolModal';
import AgentModal from './components/AgentModal';
import ClearHistoryModal from './components/ClearHistoryModal';
import { processAIResponse } from './services/api';

const STORAGE_KEY = 'thai_ai_conversation';
const API_KEY_STORAGE = 'openai_api_key';
const AGENTS_STORAGE = 'agents';
const TOOLS_STORAGE = 'function_tools';

const DEFAULT_AGENT = {
  id: 'default',
  name: 'Eva',
  character: 'เป็นเพื่อนผู้หญิงน่ารัก คอยช่วยเหลือ ใจดี',
  actions: 'ให้ตอบสั้น ๆ เหมือนคุยกับเพื่อน ให้พูดไพเราะ ลงท้ายด้วยค่ะ แทนตัวเองว่า เอวา',
  enabledTools: []
};

export default function App() {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [agents, setAgents] = useState(() => {
    const saved = localStorage.getItem(AGENTS_STORAGE);
    return saved ? JSON.parse(saved) : [DEFAULT_AGENT];
  });
  const [selectedAgentId, setSelectedAgentId] = useState(() => agents[0]?.id);
  const [tools, setTools] = useState(() => {
    const saved = localStorage.getItem(TOOLS_STORAGE);
    return saved ? JSON.parse(saved) : [];
  });
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(AGENTS_STORAGE, JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem(TOOLS_STORAGE, JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, streamingText]);

  const processUserInput = async (input) => {
    if (!input.trim()) {
      toast.error('Please provide some input');
      return;
    }

    if (!apiKey) {
      toast.error('Please enter your OpenAI API key');
      return;
    }

    const currentAgent = agents.find(a => a.id === selectedAgentId);
    if (!currentAgent) {
      toast.error('No agent selected');
      return;
    }

    setIsProcessing(true);
    setStreamingText('');

    // Immediately add user input to conversation
    setConversations(prev => ({
      ...prev,
      [selectedAgentId]: [
        ...(prev[selectedAgentId] || []),
        { userInput: input, timestamp: Date.now() }
      ]
    }));

    try {
      const enabledTools = tools.filter(tool => 
        currentAgent.enabledTools.includes(tool.id)
      );

      const result = await processAIResponse(
        input,
        apiKey,
        conversations[selectedAgentId] || [],
        currentAgent.character,
        currentAgent.actions,
        enabledTools,
        (chunk) => setStreamingText(prev => prev + chunk)
      );

      if (result) {
        // Update the conversation with the complete response
        setConversations(prev => {
          const agentConversations = prev[selectedAgentId] || [];
          const lastMessage = agentConversations[agentConversations.length - 1];
          
          return {
            ...prev,
            [selectedAgentId]: [
              ...agentConversations.slice(0, -1),
              {
                ...lastMessage,
                aiResponse: result.response,
                debug: result.debug
              }
            ]
          };
        });
      }

      setUserInput('');
      setStreamingText('');
    } catch (error) {
      console.error('Processing Error:', error);
      toast.error(error.message);
      
      // Remove the last message if there was an error
      setConversations(prev => ({
        ...prev,
        [selectedAgentId]: (prev[selectedAgentId] || []).slice(0, -1)
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddAgent = () => {
    setSelectedAgent(null);
    setIsAgentModalOpen(true);
  };

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setIsAgentModalOpen(true);
  };

  const handleDeleteAgent = (agentId) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
    if (selectedAgentId === agentId) {
      setSelectedAgentId(agents.find(a => a.id !== agentId)?.id);
    }
  };

  const handleSaveAgent = (agentData) => {
    if (selectedAgent) {
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id ? { ...agentData, id: agent.id } : agent
      ));
    } else {
      const newAgent = { ...agentData, id: crypto.randomUUID() };
      setAgents(prev => [...prev, newAgent]);
      setSelectedAgentId(newAgent.id);
    }
  };

  const handleAddTool = () => {
    setSelectedTool(null);
    setIsToolModalOpen(true);
  };

  const handleEditTool = (tool) => {
    setSelectedTool(tool);
    setIsToolModalOpen(true);
  };

  const handleSaveTool = (toolData) => {
    if (selectedTool) {
      setTools(tools.map(tool => 
        tool.id === selectedTool.id ? { ...toolData, id: tool.id } : tool
      ));
    } else {
      setTools([...tools, { ...toolData, id: crypto.randomUUID() }]);
    }
  };

  const handleClearHistory = () => {
    setIsClearHistoryModalOpen(true);
  };

  const handleConfirmClearHistory = () => {
    setConversations({});
    setIsClearHistoryModalOpen(false);
    toast.success('Chat history cleared');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isProcessing) {
      await processUserInput(userInput);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <Toaster position="top-right" />
      
      <ToolModal
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
        onSave={handleSaveTool}
        tool={selectedTool}
      />

      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSave={handleSaveAgent}
        agent={selectedAgent}
        tools={tools}
      />

      <ClearHistoryModal
        isOpen={isClearHistoryModalOpen}
        onClose={() => setIsClearHistoryModalOpen(false)}
        onConfirm={handleConfirmClearHistory}
      />

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 left-0 h-full w-80 bg-white/80 backdrop-blur-sm p-8 shadow-lg z-50 md:hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-sky-100 text-sky-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <Settings
              agents={agents}
              selectedAgentId={selectedAgentId}
              onAddAgent={handleAddAgent}
              onEditAgent={handleEditAgent}
              onDeleteAgent={handleDeleteAgent}
              onSelectAgent={setSelectedAgentId}
              tools={tools}
              onAddTool={handleAddTool}
              onEditTool={handleEditTool}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-80 bg-white/80 backdrop-blur-sm p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <Settings
          agents={agents}
          selectedAgentId={selectedAgentId}
          onAddAgent={handleAddAgent}
          onEditAgent={handleEditAgent}
          onDeleteAgent={handleDeleteAgent}
          onSelectAgent={setSelectedAgentId}
          tools={tools}
          onAddTool={handleAddTool}
          onEditTool={handleEditTool}
        />
      </div>

      {/* Main Content */}
      <div className="md:pl-80 p-4 md:p-8 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-sky-100 text-sky-500 md:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-center flex-1 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-sky-600">
            AI Assistant
          </h1>
          <TopMenu
            apiKey={apiKey}
            setApiKey={setApiKey}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto mb-6 bg-white/80 backdrop-blur-sm rounded-lg custom-scrollbar">
          <ChatHistory
            conversations={conversations}
            agentId={selectedAgentId}
            isProcessing={isProcessing}
            streamingText={streamingText}
          />
          <div ref={chatEndRef} />
        </div>

        {/* Input Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              disabled={isProcessing}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isProcessing || !userInput.trim()}
              className={`p-2 rounded-lg bg-sky-500 text-white ${
                isProcessing || !userInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}