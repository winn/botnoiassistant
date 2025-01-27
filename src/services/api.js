import { toast } from 'react-hot-toast';
import { processChatWithFunctions } from './toolsService';
import { supabase } from '../lib/supabase';
import { loadAgentConversations, saveConversation, clearConversations } from './storage';

export async function processAIResponse(
  input, 
  apiKey, 
  conversationHistory,
  botCharacter,
  botActions,
  tools = [],
  onStream,
  useSupabase = true,
  faqs = [],
  agentId = null
) {
  if (!apiKey) {
    toast.error('Please enter your OpenAI API key in settings');
    return null;
  }

  if (!input) {
    toast.error('No input provided');
    return null;
  }

  const faqSection = faqs.length > 0
    ? `\nKnowledge Base (HIGHEST PRIORITY):
${faqs.map(faq => 
  `Question: ${faq.question}
Answer: ${faq.answer}`
).join('\n\n')}\n\nIMPORTANT: When a user's question matches or is similar to any FAQ above:
1. Use the FAQ answer as your primary source of information
2. Give the exact answer to that FAQ question without any modification
3. Prioritize FAQ knowledge over other responses, don't even try to modify the defined answer`
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
   - Use the provided answer as your primary source of truth
   - Maintain your character while incorporating the FAQ knowledge
   - Never contradict the FAQ answers
4. Always maintain the character and behavior defined above
5. Prioritize knowledge in this order:
   1. FAQ answers (highest priority)
   2. Function/tool responses
   3. General knowledge${toolsSection}`;

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
    
    if (result) {
      const conversation = {
        agentId: agentId || 'default',
        userInput: input,
        aiResponse: result.response,
        debug: {
          ...result.debug,
          systemPrompt,
          faqs: faqs.length > 0 ? faqs : undefined
        }
      };

      if (useSupabase) {
        await saveConversation(conversation.agentId, conversation);
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
  return await clearConversations(agentId);
}