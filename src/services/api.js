import { toast } from 'react-hot-toast';
import { processChatWithFunctions } from './toolsService';

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