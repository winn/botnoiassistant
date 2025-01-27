import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { processAIResponse } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';

export function useChat({ playAudio, onProcessingStart, onProcessingComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const { apiKey, textToSpeechEnabled } = useSettings();

  const handleSubmit = async (input, agent, conversations, setConversations, tools = [], useSupabase = true) => {
    if (!isProcessing && input) {
      if (!apiKey) {
        toast.error('Please enter your OpenAI API key in settings');
        return;
      }

      if (!agent) {
        toast.error('No agent selected');
        return;
      }

      const timestamp = Date.now();
      
      // Add user message immediately
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

      setIsProcessing(true);
      onProcessingStart?.();
      
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
          useSupabase,
          agent.faqs || [],
          agent.id
        );

        if (result) {
          // Update conversation with AI response
          setConversations(prev => ({
            ...prev,
            [agent.id]: prev[agent.id].map(conv => 
              conv.timestamp === timestamp
                ? {
                    ...conv,
                    aiResponse: result.response,
                    debug: result.debug
                  }
                : conv
            )
          }));

          // Handle audio playback only if text-to-speech is enabled
          if (textToSpeechEnabled) {
            onProcessingComplete?.();
            await playAudio(result.response);
          } else {
            // Just complete processing without audio
            onProcessingComplete?.();
          }
        }
      } catch (error) {
        console.error('Error processing input:', error);
        toast.error(error.message || 'Failed to process input');
        onProcessingComplete?.();
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