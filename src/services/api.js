import { toast } from 'react-hot-toast';
import { processChatWithFunctions } from './toolsService';

export async function generateSpeech(text, botnoiToken) {
  try {
    if (!botnoiToken) {
      toast.error('Please enter your Botnoi Voice token in settings');
      return null;
    }

    if (!text) {
      toast.error('No text provided for speech generation');
      return null;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      toast.error('Text cannot be empty');
      return null;
    }

    const response = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
      method: 'POST',
      headers: {
        'Botnoi-Token': botnoiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmedText,
        speaker: '1',
        volume: 1,
        speed: 1,
        type_media: 'mp3',
        save_file: true,
        language: 'th',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to generate audio (${response.status})`);
    }

    if (!data.audio_url) {
      throw new Error('No audio URL received from the server');
    }

    return data.audio_url;
  } catch (error) {
    console.error('Speech Generation Error:', error);
    toast.error('Please check your Botnoi Voice token in settings');
    return null;
  }
}

export async function processAIResponse(input, apiKey, conversationHistory, botCharacter, botActions, tools = [], onStream) {
  if (!apiKey) {
    toast.error('Please enter your OpenAI API key in settings');
    return null;
  }

  if (!input) {
    toast.error('No input provided');
    return null;
  }

  const systemPrompt = `${botCharacter}\n${botActions}\n\nYou have access to external tools/APIs through function calling. When a user's request requires using these tools:
1. Analyze if any available function can help fulfill the request
2. Call the appropriate function with the required parameters
3. Use the function's response to provide a natural, conversational response
4. If no function is needed, respond directly to the user's request`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.flatMap((turn) => [
      { role: 'user', content: turn.userInput },
      { role: 'assistant', content: turn.aiResponse },
    ]),
    { role: 'user', content: input },
  ];

  try {
    const result = await processChatWithFunctions(messages, tools, apiKey, onStream);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    toast.error('Please check your OpenAI API key in settings');
    return null;
  }
}