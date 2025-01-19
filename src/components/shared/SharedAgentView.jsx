import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import ChatContainer from '../chat/ChatContainer';
import { useChat } from '../../hooks/useChat';
import { useAudio } from '../../hooks/useAudio';
import { useVoiceState } from '../../hooks/useVoiceState';
import LoadingSpinner from './LoadingSpinner';

export default function SharedAgentView({ tools }) {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const voiceState = useVoiceState();
  
  const { playAudio } = useAudio({
    onPlaybackComplete: () => {
      console.log('Audio playback completed');
      voiceState.finishSpeaking();
    }
  });

  const {
    streamingResponse,
    handleSubmit: originalHandleSubmit
  } = useChat({
    playAudio,
    onProcessingStart: () => {
      console.log('Processing started');
      voiceState.startProcessing();
    },
    onProcessingComplete: () => {
      console.log('Processing completed');
      voiceState.startSpeaking();
    }
  });

  // Custom submit handler for shared agent
  const handleSubmit = async (input, agent, conversations, setConversations) => {
    if (!input || !agent) return;

    const sessionId = crypto.randomUUID();
    setDebugInfo(null); // Clear previous debug info
    
    try {
      // Add user message to conversation immediately
      const timestamp = Date.now();
      setConversations(prev => ({
        ...prev,
        [agent.id]: [
          ...(prev[agent.id] || []),
          {
            userInput: input,
            timestamp,
            agentId: agent.id,
            agentName: agent.name
          }
        ]
      }));

      voiceState.startProcessing();

      console.log('Calling proxy with:', {
        sessionId,
        shareId: agent.id,
        message: input
      });

      // Call proxy function
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          sessionId,
          shareId: agent.id,
          message: input
        })
      });

      const responseData = await response.json();
      console.log('Proxy response:', responseData);
      setDebugInfo(responseData); // Store response for debugging

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to process request');
      }

      // Update conversation with AI response
      setConversations(prev => ({
        ...prev,
        [agent.id]: prev[agent.id].map(conv => 
          conv.timestamp === timestamp
            ? {
                ...conv,
                aiResponse: responseData.response,
                audioUrl: responseData.audio_url,
                debug: {
                  proxyResponse: responseData
                }
              }
            : conv
        )
      }));

      // Handle audio playback
      if (responseData.audio_url) {
        console.log('Playing audio from URL:', responseData.audio_url);
        voiceState.startSpeaking();
        await playAudio(responseData.response, responseData.audio_url);
      } else {
        console.log('No audio URL in response');
        voiceState.finishSpeaking();
      }

    } catch (error) {
      console.error('Error processing request:', error);
      setDebugInfo({ error: error.message, fullError: error }); // Store error for debugging
      toast.error(error.message || 'Failed to process request');
      voiceState.finishSpeaking();
    }
  };

  useEffect(() => {
    loadSharedAgent();
    
    // Cleanup function to stop voice state
    return () => {
      if (voiceState.isListening) {
        voiceState.stopListening();
      }
    };
  }, [shareId]);

  const loadSharedAgent = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!shareId) {
        throw new Error('No agent ID provided');
      }

      // Get the public agent
      const { data: publicAgent, error: publicError } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          character,
          actions,
          enabled_tools,
          faqs,
          is_public
        `)
        .eq('id', shareId)
        .eq('is_public', true)
        .single();

      if (publicError) {
        console.error('Database error:', publicError);
        throw new Error('Failed to load agent');
      }

      if (!publicAgent) {
        throw new Error('Agent not found or is not public');
      }

      setAgent(publicAgent);
    } catch (error) {
      console.error('Error loading shared agent:', error);
      setError(error.message || 'Failed to load shared agent');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading shared agent...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Agent Not Available</h1>
          <p className="text-gray-600 mb-6">{error || 'This agent is not available or has been made private.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-800">{agent.name}</h1>
            <p className="text-gray-600 mt-1">{agent.character}</p>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-gray-100 p-4 border-b">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
            <pre className="bg-white p-4 rounded-lg overflow-auto max-h-60 text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer
          agent={agent}
          tools={tools}
          voiceState={voiceState}
          streamingResponse={streamingResponse}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}