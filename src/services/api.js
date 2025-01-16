import { toast } from 'react-hot-toast';
import { processChatWithFunctions } from './toolsService';
import { supabase } from '../lib/supabase';
import { loadAgentConversations } from './storage';

export async function processAIResponse(
  input, 
  apiKey, 
  conversationHistory, 
  botCharacter, 
  botActions, 
  tools = [], 
  onStream,
  useSupabase = true
) {
  if (!apiKey) {
    toast.error('Please enter your OpenAI API key in settings');
    return null;
  }

  if (!input) {
    toast.error('No input provided');
    return null;
  }

  const agent = conversationHistory[0]?.agent || null;
  const faqs = agent?.faqs || [];

  const faqSection = faqs.length > 0
    ? `\nFrequently Asked Questions:\n${faqs.map(faq => 
        `Q: ${faq.question}\nA: ${faq.answer}`
      ).join('\n\n')}`
    : '';

  const toolsSection = tools.length > 0
    ? `\n\nAvailable Tools:\n${tools.map((tool, index) => 
        `${index + 1}. ${tool.name}\n   Description: ${tool.description}\n   Input: ${tool.input.description}\n   Output: ${tool.output.description}`
      ).join('\n\n')}`
    : '';

  const systemPrompt = `Character Description:
${botCharacter}

Behavior Instructions:
${botActions}${faqSection}

Instructions for Tool Usage:
1. When a user's request requires using tools:
   - Analyze if any available function can help fulfill the request
   - Call the appropriate function with the required parameters
   - Use the function's response to provide a natural response
2. If no function is needed, respond directly to the user's request
3. If the user's question matches any FAQ:
   - Use the provided answer as a reference
   - Maintain your character while incorporating the FAQ knowledge
4. Always maintain the character and behavior defined above
5. Integrate knowledge from FAQs naturally into your responses${toolsSection}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.flatMap((turn) => [
      { role: 'user', content: turn.userInput },
      turn.aiResponse && { role: 'assistant', content: turn.aiResponse }
    ]).filter(Boolean),
    { role: 'user', content: input },
  ];

  try {
    const result = await processChatWithFunctions(messages, tools, apiKey, onStream);
    
    if (result && useSupabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('conversations')
          .insert([{
            agent_id: conversationHistory[0]?.agentId || 'default',
            user_input: input,
            ai_response: result.response,
            debug_info: result.debug,
            user_id: user?.id
          }]);

        if (error) {
          console.warn('Error storing conversation:', error);
        }
      } catch (err) {
        console.warn('Failed to store conversation:', err);
      }
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    toast.error(error.message || 'Failed to process request');
    return null;
  }
}

export async function loadConversationHistory(agentId) {
  if (!agentId) return [];
  return await loadAgentConversations(agentId);
}

export async function clearConversationHistory(agentId) {
  if (!agentId) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('agent_id', agentId)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Error clearing conversations:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Failed to clear conversations:', error);
    return false;
  }
}