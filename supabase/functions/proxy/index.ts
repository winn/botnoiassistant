import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Cache for frequently accessed data
const cache = {
  agents: new Map<string, any>(),
  credentials: new Map<string, any>(),
  tools: new Map<string, any[]>(),
};

// Fetch agent data with caching
async function fetchAgent(agentId: string) {
  if (cache.agents.has(agentId)) {
    return cache.agents.get(agentId);
  }

  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, name, character, actions, enabled_tools, faqs, user_id, session_quota')
    .eq('id', agentId)
    .eq('is_public', true)
    .single();

  if (error || !agent) {
    throw new Error('Agent not found or not public');
  }

  cache.agents.set(agentId, agent);
  return agent;
}

// Fetch credentials with caching
async function fetchCredentials(userId: string) {
  if (cache.credentials.has(userId)) {
    return cache.credentials.get(userId);
  }

  const { data: credentials, error } = await supabase
    .from('credentials')
    .select('name, value')
    .eq('user_id', userId)
    .in('name', ['openai', 'botnoi']);

  if (error) {
    throw new Error('Failed to get credentials');
  }

  const credentialsObj = credentials.reduce((acc, curr) => {
    acc[curr.name] = curr.value;
    return acc;
  }, {});

  cache.credentials.set(userId, credentialsObj);
  return credentialsObj;
}

// Fetch tools with caching
async function fetchTools(agentId: string, enabledTools: string[]) {
  if (cache.tools.has(agentId)) {
    return cache.tools.get(agentId);
  }

  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    .in('id', enabledTools);

  if (error) {
    throw new Error('Failed to get tools');
  }

  cache.tools.set(agentId, tools);
  return tools;
}

// Process OpenAI chat
async function processOpenAIChat(messages: any[], functions: any[], apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      functions,
      function_call: functions?.length ? 'auto' : undefined,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `OpenAI API failed with status ${response.status}`);
  }

  return await response.json();
}

// Generate Botnoi audio
async function generateBotnoiAudio(text: string, token: string) {
  const response = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
    method: 'POST',
    headers: {
      'Botnoi-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
      speaker: '1',
      volume: 1,
      speed: 1,
      type_media: 'mp3',
      save_file: true,
      language: 'th',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Botnoi API failed with status ${response.status}`);
  }

  return await response.json();
}

// Convert tool to OpenAI function
function convertToolToFunction(tool: any) {
  try {
    const inputSchema = typeof tool.input === 'string' ? JSON.parse(tool.input) : tool.input;

    return {
      name: tool.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
      description: `${tool.description}\n\nInput: ${inputSchema.description}\nOutput: ${tool.output.description}`,
      parameters: inputSchema.schema ? JSON.parse(inputSchema.schema) : {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: inputSchema.description || 'Input query',
          },
        },
        required: ['query'],
      },
    };
  } catch (error) {
    console.error('Error converting tool to function:', error);
    return null;
  }
}

// Execute tool function
async function executeToolFunction(tool: any, parameters: any) {
  try {
    const headers = typeof tool.headers === 'string' ? JSON.parse(tool.headers) : tool.headers || {};
    const requestConfig: any = {
      method: tool.method,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    };

    if (tool.method === 'POST') {
      requestConfig.headers['Content-Type'] = 'application/json';
      const bodyTemplate = typeof tool.body === 'string' ? JSON.parse(tool.body) : tool.body || {};
      const processedBody = JSON.stringify(bodyTemplate).replace(
        /{{\s*([^}]+)\s*}}/g,
        (_, key) => JSON.stringify(parameters[key])
      );
      requestConfig.body = processedBody;
    }

    const response = await fetch(tool.endpoint, requestConfig);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      tool_name: tool.name,
      description: tool.description,
      input: parameters,
      output: data,
    };
  } catch (error) {
    console.error('Error executing tool function:', error);
    return {
      success: false,
      error: error.message,
      tool_name: tool.name,
    };
  }
}

// Handle incoming requests
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { agentId, timestamp, message, sessionId: existingSessionId } = await req.json();

    if (!agentId) {
      throw new Error('Missing agent ID');
    }

    // Fetch agent data
    const agent = await fetchAgent(agentId);

    // Fetch credentials and tools in parallel
    const [credentials, tools] = await Promise.all([
      fetchCredentials(agent.user_id),
      fetchTools(agentId, agent.enabled_tools),
    ]);

    // Handle existing session
    if (existingSessionId && message) {
      const { data: currentSession, error: sessionError } = await supabase
        .from('shared_sessions')
        .select('message_count, daily_usage, conversation_history')
        .eq('session_id', existingSessionId)
        .eq('agent_id', agentId)
        .single();

      if (sessionError) {
        throw new Error('Failed to get session');
      }

      if (currentSession.message_count >= agent.session_quota) {
        throw new Error('Session quota exceeded');
      }

      // Construct OpenAI messages
      const faqSection = agent.faqs?.length > 0
        ? `\nFrequently Asked Questions:\n${agent.faqs.map((faq: any) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}`
        : '';

      const toolsSection = tools?.length > 0
        ? `\n\nAvailable Tools:\n${tools.map((tool: any, index: number) => 
            `${index + 1}. ${tool.name}\n   Description: ${tool.description}\n   Input: ${tool.input.description}\n   Output: ${tool.output.description}`
          ).join('\n\n')}`
        : '';

      const systemPrompt = `Character Description:
${agent.character}

Behavior Instructions:
${agent.actions}${faqSection}

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

      const conversationHistory = currentSession.conversation_history || [];
      if (conversationHistory.length === 0) {
        conversationHistory.push({ role: 'system', content: systemPrompt });
      }

      conversationHistory.push({ role: 'user', content: message });

      const functions = tools.map(convertToolToFunction).filter(Boolean);
      const openaiResponse = await processOpenAIChat(conversationHistory, functions, credentials.openai);

      let finalResponse = '';
      const debug = {
        timestamp: new Date().toISOString(),
        functions,
        initialResponse: openaiResponse,
      };

      if (openaiResponse.choices[0].message.function_call) {
        debug.functionCall = openaiResponse.choices[0].message.function_call;

        const functionName = openaiResponse.choices[0].message.function_call.name;
        const tool = tools.find((t: any) => 
          t.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') === functionName
        );

        if (!tool) {
          throw new Error(`Function ${functionName} not found in tools`);
        }

        const args = JSON.parse(openaiResponse.choices[0].message.function_call.arguments);
        const functionResult = await executeToolFunction(tool, args);
        debug.functionResult = functionResult;

        conversationHistory.push(openaiResponse.choices[0].message);
        conversationHistory.push({
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResult),
        });

        const finalOpenAIResponse = await processOpenAIChat(conversationHistory, functions, credentials.openai);
        debug.finalResponse = finalOpenAIResponse;
        finalResponse = finalOpenAIResponse.choices[0].message.content;

        conversationHistory.push({ role: 'assistant', content: finalResponse });
      } else {
        finalResponse = openaiResponse.choices[0].message.content;
        conversationHistory.push({ role: 'assistant', content: finalResponse });
      }

      let audioUrl = null;
      if (credentials.botnoi) {
        try {
          const botnoiResponse = await generateBotnoiAudio(finalResponse, credentials.botnoi);
          audioUrl = botnoiResponse.audio_url;
        } catch (error) {
          console.error('Botnoi API Error:', error);
        }
      }

      await supabase
        .from('shared_sessions')
        .update({
          message_count: (currentSession.message_count || 0) + 1,
          daily_usage: (currentSession.daily_usage || 0) + 1,
          last_message_at: new Date().toISOString(),
          conversation_history: conversationHistory,
        })
        .eq('session_id', existingSessionId)
        .eq('agent_id', agentId);

      return new Response(
        JSON.stringify({
          success: true,
          response: finalResponse,
          audio_url: audioUrl,
          debug,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Handle new session
    if (!timestamp) {
      throw new Error('Missing timestamp for new session');
    }

    const sessionId = `${agentId}_${timestamp}`;
    const { data: session, error: sessionError } = await supabase
      .from('shared_sessions')
      .insert({
        agent_id: agentId,
        session_id: sessionId,
        message_count: 0,
        daily_usage: 0,
        session_quota: agent.session_quota,
        conversation_history: [],
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        session,
        agent: {
          id: agent.id,
          name: agent.name,
          character: agent.character,
          actions: agent.actions,
          faqs: agent.faqs,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});