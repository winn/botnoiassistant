import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, StopIcon, PaperAirplaneIcon, Bars3Icon, XMarkIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Toaster, toast } from 'react-hot-toast';
import Settings from './components/Settings';
import TopMenu from './components/TopMenu';
import ChatHistory from './components/ChatHistory';
import AgentModal from './components/AgentModal';
import ToolModal from './components/ToolModal';
import ClearHistoryModal from './components/ClearHistoryModal';
import AuthModal from './components/auth/AuthModal';
import UserMenu from './components/auth/UserMenu';
import { processAIResponse, loadConversationHistory, clearConversationHistory } from './services/api';
import { saveAgent, loadAgents, saveTool, loadTools, loadCredential, loadUserProfile } from './services/storage';
import { supabase } from './lib/supabase';

// Default agent configuration
const DEFAULT_AGENT = {
  id: crypto.randomUUID(),
  name: 'Eva',
  character: 'เป็นเพื่อนผู้หญิงน่ารัก คอยช่วยเหลือ ใจดี',
  actions: 'ให้ตอบสั้น ๆ เหมือนคุยกับเพื่อน ให้พูดไพเราะ ลงท้ายด้วยค่ะ แทนตัวเองว่า เอวา',
  enabledTools: [],
  faqs: []
};

function App() {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [conversations, setConversations] = useState({});
  const [streamingResponse, setStreamingResponse] = useState('');
  const [agents, setAgents] = useState([DEFAULT_AGENT]);
  const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENT.id);
  const [tools, setTools] = useState([]);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [useSupabase, setUseSupabase] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Load initial data from Supabase
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Load API key from credentials
        const savedApiKey = await loadCredential('openai');
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }

        // Load agents
        const loadedAgents = await loadAgents();
        if (loadedAgents && loadedAgents.length > 0) {
          setAgents(loadedAgents);
          setSelectedAgentId(loadedAgents[0].id);
        }

        // Load tools
        const loadedTools = await loadTools();
        if (loadedTools) {
          setTools(loadedTools);
        }

        // Load user profile if logged in
        const profile = await loadUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    }
    loadInitialData();
  }, []);

  // Auth effect
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load conversation history when agent changes
  useEffect(() => {
    async function loadHistory() {
      const history = await loadConversationHistory(selectedAgentId);
      if (history.length > 0) {
        setConversations(prev => ({ ...prev, [selectedAgentId]: history }));
      }
    }
    loadHistory();
  }, [selectedAgentId]);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, streamingResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isProcessing && userInput.trim()) {
      const currentInput = userInput.trim();
      setUserInput('');
      
      const currentAgent = agents.find(a => a.id === selectedAgentId);
      if (!currentAgent) {
        toast.error('No agent selected');
        return;
      }
      
      const timestamp = Date.now();
      setConversations(prev => ({
        ...prev,
        [selectedAgentId]: [
          ...(prev[selectedAgentId] || []),
          {
            userInput: currentInput,
            timestamp,
            agentId: selectedAgentId,
            agentName: currentAgent.name,
            agent: currentAgent
          }
        ]
      }));

      setIsProcessing(true);
      try {
        const enabledTools = tools.filter(tool => 
          currentAgent.enabledTools.includes(tool.id)
        );

        const result = await processAIResponse(
          currentInput,
          apiKey,
          conversations[selectedAgentId] || [],
          currentAgent.character,
          currentAgent.actions,
          enabledTools,
          (chunk) => setStreamingResponse(prev => prev + chunk),
          useSupabase
        );

        if (result) {
          setConversations(prev => ({
            ...prev,
            [selectedAgentId]: prev[selectedAgentId].map(conv => 
              conv.timestamp === timestamp
                ? {
                    ...conv,
                    aiResponse: result.response,
                    debug: result.debug
                  }
                : conv
            )
          }));
        }
      } catch (error) {
        console.error('Error processing input:', error);
        toast.error(error.message || 'Failed to process input');
      } finally {
        setIsProcessing(false);
        setStreamingResponse('');
        inputRef.current?.focus();
      }
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

  const handleDeleteAgent = async (agentId) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      setAgents(prev => prev.filter(a => a.id !== agentId));
      if (selectedAgentId === agentId) {
        setSelectedAgentId(agents.find(a => a.id !== agentId)?.id);
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleSaveAgent = async (agentData) => {
    const savedAgent = await saveAgent(agentData);
    if (savedAgent) {
      if (selectedAgent) {
        setAgents(prev => prev.map(agent => 
          agent.id === selectedAgent.id ? savedAgent : agent
        ));
      } else {
        setAgents(prev => [...prev, savedAgent]);
        setSelectedAgentId(savedAgent.id);
      }
      setIsAgentModalOpen(false);
      toast.success(selectedAgent ? 'Agent updated' : 'Agent created');
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

  const handleSaveTool = async (toolData) => {
    const savedTool = await saveTool(toolData);
    if (savedTool) {
      if (selectedTool) {
        setTools(prev => prev.map(tool => 
          tool.id === selectedTool.id ? savedTool : tool
        ));
      } else {
        setTools(prev => [...prev, savedTool]);
      }
      setIsToolModalOpen(false);
      toast.success(selectedTool ? 'Tool updated' : 'Tool created');
    }
  };

  const handleClearHistory = async () => {
    if (await clearConversationHistory(selectedAgentId)) {
      setConversations(prev => ({ ...prev, [selectedAgentId]: [] }));
      toast.success('Chat history cleared');
    } else {
      toast.error('Failed to clear chat history');
    }
    setIsClearHistoryModalOpen(false);
  };

  const handleLoginSuccess = async ({ profile, agents: newAgents, tools: newTools, conversations: newConversations, credentials }) => {
    setUserProfile(profile);
    if (newAgents?.length > 0) setAgents(newAgents);
    if (newTools?.length > 0) setTools(newTools);
    if (newConversations) {
      const groupedConversations = newConversations.reduce((acc, conv) => {
        const agentId = conv.agentId;
        if (!acc[agentId]) acc[agentId] = [];
        acc[agentId].push(conv);
        return acc;
      }, {});
      setConversations(groupedConversations);
    }
    if (credentials?.openaiKey) {
      setApiKey(credentials.openaiKey);
    }
    setIsAuthModalOpen(false);
  };

  const currentAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="min-h-screen bg-sky-50">
      <Toaster position="top-right" />
      
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
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-sky-100 text-sky-500 md:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-center flex-1 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-sky-600">
            {currentAgent?.name || 'Voice Assistant'}
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsClearHistoryModalOpen(true)}
              className="p-2 rounded-lg hover:bg-sky-100 text-sky-500"
            >
              <TrashIcon className="h-6 w-6" />
            </button>
            <UserMenu 
              user={user}
              profile={userProfile}
              onLoginClick={() => setIsAuthModalOpen(true)}
            />
            <TopMenu
              apiKey={apiKey}
              setApiKey={setApiKey}
              useSupabase={useSupabase}
              setUseSupabase={setUseSupabase}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 bg-white/80 backdrop-blur-sm rounded-lg">
          <ChatHistory
            conversations={conversations}
            agentId={selectedAgentId}
            isProcessing={isProcessing}
            streamingText={streamingResponse}
          />
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              disabled={isProcessing}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isProcessing || !userInput.trim()}
              className={`p-2 rounded-lg bg-sky-500 text-white ${
                isProcessing || !userInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-600'
              }`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSave={handleSaveAgent}
        agent={selectedAgent}
        tools={tools}
      />
      <ToolModal
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
        onSave={handleSaveTool}
        tool={selectedTool}
      />
      <ClearHistoryModal
        isOpen={isClearHistoryModalOpen}
        onClose={() => setIsClearHistoryModalOpen(false)}
        onConfirm={handleClearHistory}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;