import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import ChatContainer from '../chat/ChatContainer';
import { useChat } from '../../hooks/useChat';
import { useAudio } from '../../hooks/useAudio';
import { useVoiceState } from '../../hooks/useVoiceState';
import LoadingSpinner from './feedback/LoadingSpinner';

export default function SharedAgentView({ tools }) {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const voiceState = useVoiceState();
  
  const { playAudio } = useAudio({
    onPlaybackComplete: () => {
      console.log('Audio playback completed');
      voiceState.finishSpeaking();
    }
  });

  const handleSubmit = async (input, agent) => {
    if (!input || !agent) return;

    if (!sessionId) {
      toast.error('Session not initialized');
      return;
    }
    
    try {
      // Check session quota before making the request
      const { data: currentSession, error: sessionError } = await supabase
        .from('shared_sessions')
        .select('message_count')
        .eq('session_id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      if (currentSession.message_count >= agent.session_quota) {
        toast((t) => (
          <div className="flex flex-col">
            <span className="font-semibold">Session Limit Reached</span>
            <span className="text-sm">
              Maximum {agent.session_quota} messages per session allowed.
            </span>
          </div>
        ), {
          duration: 5000,
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #F87171',
            padding: '16px',
            borderRadius: '8px',
            minWidth: '300px'
          },
          icon: '🚫'
        });
        voiceState.finishSpeaking();
        return;
      }

      const timestamp = Date.now();
      
      // Update local state immediately
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

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          agentId: agent.id,
          sessionId,
          message: input
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to process request');
      }

      // Add debug information
      const debug = {
        timestamp: new Date().toISOString(),
        sessionId,
        agentId: agent.id,
        input,
        response: responseData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };

      // Update conversation with AI response
      setConversations(prev => ({
        ...prev,
        [agent.id]: prev[agent.id].map(conv => 
          conv.timestamp === timestamp
            ? {
                ...conv,
                aiResponse: responseData.response,
                audioUrl: responseData.audio_url,
                debug
              }
            : conv
        )
      }));

      if (responseData.audio_url) {
        voiceState.startSpeaking();
        await playAudio(responseData.response, responseData.audio_url);
      } else {
        voiceState.finishSpeaking();
      }

    } catch (error) {
      console.error('Error processing request:', error);
      
      // Add error to debug information
      const debug = {
        timestamp: new Date().toISOString(),
        sessionId,
        agentId: agent.id,
        input,
        error: {
          message: error.message,
          stack: error.stack
        }
      };

      setConversations(prev => ({
        ...prev,
        [agent.id]: prev[agent.id].map(conv => 
          conv.timestamp === timestamp
            ? {
                ...conv,
                error: error.message,
                debug
              }
            : conv
        )
      }));

      toast.error(error.message || 'Failed to process request');
      voiceState.finishSpeaking();
    }
  };

  useEffect(() => {
    loadSharedAgent();
    
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

      const { data: publicAgent, error: publicError } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          character,
          actions,
          enabled_tools,
          faqs,
          is_public,
          session_quota
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
      setConversations({ [publicAgent.id]: [] });
      
      // Initialize session
      const timestamp = Date.now();
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          agentId: publicAgent.id,
          timestamp
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize session');
      }

      setSessionId(data.sessionId);

    } catch (error) {
      console.error('Error loading shared agent:', error);
      setError(error.message || 'Failed to load shared agent');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-[#01BFFB] mb-4" />
          <p className="text-[#262626] font-medium">Loading shared agent...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#262626] mb-2">Agent Not Available</h1>
          <p className="text-[#262626] mb-6">{error || 'This agent is not available or has been made private.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#01BFFB] text-[#ffffff] rounded-lg hover:opacity-90 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const messagesRemaining = Math.max(0, agent.session_quota - (conversations[agent.id]?.length || 0));

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-[#ffffff] border-b border-[#262626]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-[#262626]">{agent.name}</h1>
          <p className="text-[#262626] mt-1">{agent.character}</p>
          <div className="mt-2 text-sm">
            <span className={`font-medium ${messagesRemaining < 3 ? 'text-red-600' : 'text-[#262626]/70'}`}>
              Messages remaining: {messagesRemaining}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 min-h-0 bg-[#ffffff]">
        <div className="h-full max-w-4xl mx-auto">
          <ChatContainer
            agent={agent}
            tools={tools}
            voiceState={voiceState}
            onSubmit={handleSubmit}
            conversations={conversations}
            setConversations={setConversations}
          />
        </div>
      </div>
    </div>
  );
}