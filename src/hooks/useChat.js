import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { processAIResponse } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';

export function useChat({ playAudio, onProcessingStart, onProcessingComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const { apiKey, isSpeakerOn } = useSettings();

  const processResponse = async (result, agentId, timestamp, conversations, setConversations) => {
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
      onProcessingComplete(); // Signal processing complete before playing audio
      const isPlaying = await playAudio(result.response);
      if (!isPlaying) {
        console.log('TTS failed or was not started');
      }
    } else {
      onProcessingComplete(); // Signal processing complete if no audio
    }
  };

  const handleSubmit = async (input, agent, conversations, setConversations, tools = [], useSupabase = true) => {
    if (!isProcessing && input) {
      if (!apiKey) {
        toast.error('Please enter your OpenAI API key in settings');
        return;
      }

      const timestamp = Date.now();
      
      if (!agent) {
        toast.error('No agent selected');
        return;
      }
      
      setConversations(prev => ({
        ...prev,
        [agent.id]: [
          ...(prev[agent.id] || []),
          {
            userInput: input,
            timestamp,
            agentId: agent.id,
            agentName: agent.name,
            agent: agent
          }
        ]
      }));

      setIsProcessing(true);
      onProcessingStart();
      
      try {
        const enabledTools = tools.filter(tool => 
          agent.enabled_tools?.includes(tool.id)
        );

        const result = await processAIResponse(
          input,
          apiKey,
          conversations[agent.id] || [],
          agent.character,
          agent.actions,
          enabledTools,
          (chunk) => setStreamingResponse(prev => prev + chunk),
          useSupabase
        );

        if (result) {
          await processResponse(result, agent.id, timestamp, conversations, setConversations);
        }
      } catch (error) {
        console.error('Error processing input:', error);
        toast.error(error.message || 'Failed to process input');
        onProcessingComplete(); // Signal processing complete on error
      } finally {
        setIsProcessing(false);
        setStreamingResponse('');
      }
    }
  };

  return {
    isProcessing,
    streamingResponse,
    handleSubmit
  };
}