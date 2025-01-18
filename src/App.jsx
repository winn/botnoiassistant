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

const DEFAULT_AGENT = {
  id: crypto.randomUUID(),
  name: 'Eva',
  character: 'เป็นเพื่อนผู้หญิงน่ารัก คอยช่วยเหลือ ใจดี',
  actions: 'ให้ตอบสั้น ๆ เหมือนคุยกับเพื่อน ให้พูดไพเราะ ลงท้ายด้วยค่ะ แทนตัวเองว่า เอวา',
  enabled_tools: [],
  faqs: []
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [botnoiToken, setBotnoiToken] = useState('');
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
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastInputMode, setLastInputMode] = useState('text');
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpeechRef = useRef(Date.now());
  const finalTranscriptRef = useRef('');
  const audioRef = useRef(null);
  const audioEndedCallbackRef = useRef(null);

  // Load initial data from Supabase
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Load API keys from credentials
        const savedApiKey = await loadCredential('openai');
        const savedBotnoiToken = await loadCredential('botnoi');
        if (savedApiKey) setApiKey(savedApiKey);
        if (savedBotnoiToken) setBotnoiToken(savedBotnoiToken);

        // Load agents
        const loadedAgents = await loadAgents();
        if (loadedAgents?.length > 0) {
          setAgents(loadedAgents);
          setSelectedAgentId(loadedAgents[0].id);
        }

        // Load tools
        const loadedTools = await loadTools();
        if (loadedTools) setTools(loadedTools);

        // Load user profile if logged in
        const profile = await loadUserProfile();
        if (profile) setUserProfile(profile);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    }
    loadInitialData();
  }, []);

  // Auth effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

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

  // Cleanup effect for audio and recognition
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioEndedCallbackRef.current) {
          audioRef.current.removeEventListener('ended', audioEndedCallbackRef.current);
        }
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  const playAudio = async (text) => {
    console.log('Starting TTS with text:', text);
    if (!botnoiToken) {
      toast.error('Please enter your Botnoi Voice token in settings');
      return;
    }

    try {
      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioEndedCallbackRef.current) {
          audioRef.current.removeEventListener('ended', audioEndedCallbackRef.current);
        }
      }

      const response = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
        method: 'POST',
        headers: {
          'Botnoi-Token': botnoiToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          speaker: "1",
          volume: 1,
          speed: 1,
          type_media: "mp3",
          save_file: true,
          language: "th"
        })
      });

      const result = await response.json();
      console.log('TTS API response:', result);

      if (result.audio_url) {
        const audio = new Audio(result.audio_url);
        audioRef.current = audio;

        // Create and store the callback
        const onEnded = () => {
          console.log('Audio ended, lastInputMode:', lastInputMode);
          if (lastInputMode === 'voice') {
            console.log('Starting speech recognition after audio');
            startSpeechRecognition();
          }
        };
        audioEndedCallbackRef.current = onEnded;

        // Add event listener
        audio.addEventListener('ended', onEnded);

        console.log('Playing audio...');
        await audio.play();
      } else {
        throw new Error('Failed to get audio URL');
      }
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error('Failed to generate speech');
      // Even if TTS fails, start listening if last input was voice
      if (lastInputMode === 'voice') {
        console.log('Starting speech recognition after TTS error');
        startSpeechRecognition();
      }
    }
  };

  const processResponse = async (result, agentId, timestamp) => {
    console.log('Processing response, lastInputMode:', lastInputMode);
    // Update conversations first
    setConversations(prev => ({
      ...prev,
      [agentId]: prev[agentId].map(conv => 
        conv.timestamp === timestamp
          ? {
              ...conv,
              aiResponse: result.response,
              debug: result.debug
            }
          : conv
      )
    }));

    // Then play TTS if enabled
    if (isSpeakerOn) {
      console.log('Speaker is on, playing audio');
      await playAudio(result.response);
    } else if (lastInputMode === 'voice') {
      console.log('Speaker is off but last input was voice, starting recognition');
      startSpeechRecognition();
    }
  };

  const toggleSpeech = () => {
    console.log('Toggling speech, current state:', isListening);
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    } else {
      setLastInputMode('voice');
      startSpeechRecognition();
    }
  };

  const startSpeechRecognition = () => {
    console.log('Starting speech recognition');
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    // Cleanup previous instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'th-TH';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      finalTranscriptRef.current = '';
      lastSpeechRef.current = Date.now();
      silenceTimeoutRef.current = setTimeout(checkSilence, 500);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          lastSpeechRef.current = Date.now();
          console.log('Final transcript:', finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current = finalTranscript;
        setUserInput(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const checkSilence = () => {
    const now = Date.now();
    const timeSinceLastSpeech = now - lastSpeechRef.current;
    console.log('Checking silence, time since last speech:', timeSinceLastSpeech);

    if (timeSinceLastSpeech > 2000 && finalTranscriptRef.current.trim()) {
      console.log('Silence detected with transcript:', finalTranscriptRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        if (!apiKey) {
          toast.error('Please enter your OpenAI API key in settings');
          return;
        }
        const transcript = finalTranscriptRef.current.trim();
        setUserInput(transcript);
        handleSubmit({ preventDefault: () => {} }, transcript);
      }
    } else if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(checkSilence, 500);
    }
  };

  const handleSubmit = async (e, forcedInput = null) => {
    e.preventDefault();
    const currentInput = forcedInput || userInput.trim();
    console.log('Submitting input:', currentInput, 'Forced:', !!forcedInput);
    
    if (!isProcessing && currentInput) {
      if (!apiKey) {
        toast.error('Please enter your OpenAI API key in settings');
        return;
      }

      // Update input mode based on how the input was provided
      setLastInputMode(forcedInput ? 'voice' : 'text');
      console.log('Setting lastInputMode to:', forcedInput ? 'voice' : 'text');

      setUserInput('');
      const timestamp = Date.now();
      
      const currentAgent = agents.find(a => a.id === selectedAgentId);
      if (!currentAgent) {
        toast.error('No agent selected');
        return;
      }
      
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
          currentAgent.enabled_tools.includes(tool.id)
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
          await processResponse(result, selectedAgentId, timestamp);
        }
      } catch (error) {
        console.error('Error processing input:', error);
        toast.error(error.message || 'Failed to process input');
        // If there's an error and last input was voice, restart listening
        if (lastInputMode === 'voice') {
          console.log('Restarting speech recognition after error');
          startSpeechRecognition();
        }
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
    if (newAgents?.length > 0) {
      setAgents(newAgents);
      setSelectedAgentId(newAgents[0].id);
    }
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
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-2 rounded-lg ${
                isSpeakerOn ? 'bg-sky-100 text-sky-500' : 'text-gray-400'
              }`}
            >
              {isSpeakerOn ? '🔊' : '🔇'}
            </button>
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
              botnoiToken={botnoiToken}
              setBotnoiToken={setBotnoiToken}
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
              onChange={(e) => {
                setUserInput(e.target.value);
                setLastInputMode('text');
              }}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              disabled={isProcessing}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={toggleSpeech}
              className={`p-2 rounded-lg ${
                isListening ? 'bg-red-500' : 'bg-sky-500'
              } text-white`}
            >
              {isListening ? (
                <StopIcon className="h-5 w-5" />
              ) : (
                <MicrophoneIcon className="h-5 w-5" />
              )}
            </motion.button>
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