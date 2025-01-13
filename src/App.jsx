import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, PaperAirplaneIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import Settings from './components/Settings';
import ChatHistory from './components/ChatHistory';
import TopMenu from './components/TopMenu';
import ToolModal from './components/ToolModal';
import AgentModal from './components/AgentModal';

import { generateSpeech, processAIResponse } from './services/api';

const STORAGE_KEY = 'thai_ai_conversation';
const API_KEY_STORAGE = 'openai_api_key';
const BOTNOI_TOKEN_STORAGE = 'botnoi_token';

const DEFAULT_AGENT = {
  id: 'default',
  name: 'Eva',
  character: 'เป็นเพื่อนผู้หญิงน่ารัก คอยช่วยเหลือ ใจดี',
  actions: 'ให้ตอบสั้น ๆ เหมือนคุยกับเพื่อน ให้พูดไพเราะ ลงท้ายด้วยค่ะ แทนตัวเองว่า เอวา',
  enabledTools: []
};

export default function App() {
  const [recognitionAllowed, setRecognitionAllowed] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [botnoiToken, setBotnoiToken] = useState(() => localStorage.getItem(BOTNOI_TOKEN_STORAGE) || '');
  const [conversationHistory, setConversationHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { default: [] };
  });
  const [tools, setTools] = useState([]);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([DEFAULT_AGENT]);
  const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENT.id);

  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationHistory));
  }, [conversationHistory]);

  useEffect(() => {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(BOTNOI_TOKEN_STORAGE, botnoiToken);
  }, [botnoiToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsProcessing(false);
    if (isVoiceMode) {
      startWebSpeechRecognition();
    }
  };

  const startWebSpeechRecognition = () => {
    if (!recognitionAllowed || !('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported');
      return null;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'th-TH';

    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setIsListening(false);
      await processUserInput(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
      toast.error(`Speech recognition error: ${event.error}`);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
    toast.success('Listening...');
    return recognitionRef.current;
  };

  const handleStopRecording = () => {
    setRecognitionAllowed(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
    setUserInput('');
    setMessage('');
    setIsProcessing(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);

    toast.success('Recording stopped');
  };

  const processUserInput = async (input) => {
    if (!input.trim()) {
      toast.error('Please provide some input');
      return;
    }

    setIsProcessing(true);
    setMessage('Processing...');

    const currentAgent = agents.find(a => a.id === selectedAgentId) || DEFAULT_AGENT;
    const agentHistory = conversationHistory[currentAgent.id] || [];
    const enabledTools = tools.filter(tool => 
      Array.isArray(currentAgent.enabledTools) && 
      currentAgent.enabledTools.includes(tool.id)
    );

    // Create a new conversation turn immediately
    const newTurn = {
      userInput: input,
      aiResponse: '',
      debug: null,
      timestamp: Date.now()
    };

    setConversationHistory(prev => ({
      ...prev,
      [currentAgent.id]: [
        ...(prev[currentAgent.id] || []),
        newTurn
      ]
    }));

    try {
      const result = await processAIResponse(
        input,
        apiKey,
        agentHistory,
        currentAgent.character,
        currentAgent.actions,
        enabledTools,
        (chunk) => {
          setConversationHistory(prev => ({
            ...prev,
            [currentAgent.id]: prev[currentAgent.id].map(turn => 
              turn.timestamp === newTurn.timestamp
                ? { ...turn, aiResponse: turn.aiResponse + chunk }
                : turn
            )
          }));
        }
      );
      
      if (!result) {
        setIsProcessing(false);
        return;
      }

      // Update the final response and debug information
      setConversationHistory(prev => ({
        ...prev,
        [currentAgent.id]: prev[currentAgent.id].map(turn => 
          turn.timestamp === newTurn.timestamp
            ? { ...turn, debug: result.debug }
            : turn
        )
      }));

      setUserInput('');

      // Only generate speech in voice mode
      if (isVoiceMode) {
        const audioUrl = await generateSpeech(result.response, botnoiToken);
        if (audioUrl && audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onerror = () => {
            console.error('Audio playback failed');
            toast.error('Failed to play audio');
            setIsPlaying(false);
            setIsProcessing(false);
          };
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (error) {
            console.error('Audio playback failed:', error);
            toast.error('Failed to play audio');
            setIsPlaying(false);
            setIsProcessing(false);
          }
        } else {
          setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Processing Error:', error);
      toast.error(error.message || 'An error occurred');
      setIsProcessing(false);
    } finally {
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isProcessing) {
      await processUserInput(userInput);
    }
  };

  const handleMicButton = () => {
    if (!isListening && !isProcessing) {
      startWebSpeechRecognition();
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
    if (agents.length <= 1) {
      toast.error('Cannot delete the last agent');
      return;
    }

    setAgents(agents.filter(a => a.id !== agentId));
    if (selectedAgentId === agentId) {
      setSelectedAgentId(agents[0].id);
    }
  };

  const handleSaveAgent = (agentData) => {
    if (selectedAgent) {
      setAgents(agents.map(agent =>
        agent.id === selectedAgent.id
          ? { ...agentData, id: agent.id }
          : agent
      ));
    } else {
      const newAgent = {
        ...agentData,
        id: crypto.randomUUID()
      };
      setAgents([...agents, newAgent]);
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
            Voice Assistant
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isVoiceMode
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isVoiceMode ? 'Voice Mode' : 'Chat Mode'}
            </button>
            <TopMenu
              apiKey={apiKey}
              setApiKey={setApiKey}
              botnoiToken={botnoiToken}
              setBotnoiToken={setBotnoiToken}
            />
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto mb-6 bg-white/80 backdrop-blur-sm rounded-lg custom-scrollbar">
          <ChatHistory 
            conversations={conversationHistory}
            agentId={selectedAgentId}
          />
          <div ref={chatEndRef} />
        </div>

        {/* Input Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
          {isVoiceMode && (
            <div className="flex justify-center space-x-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMicButton}
                disabled={isProcessing || isListening}
                className={`p-4 rounded-full ${
                  isListening ? 'bg-gray-400' : 'bg-sky-500'
                } text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
              >
                <MicrophoneIcon className="h-8 w-8" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStopRecording}
                disabled={!isListening}
                className={`p-4 rounded-full ${
                  !isListening ? 'bg-gray-400' : 'bg-red-500'
                } text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
              >
                <StopIcon className="h-8 w-8" />
              </motion.button>
            </div>
          )}
          
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
        <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
      </div>
    </div>
  );
}