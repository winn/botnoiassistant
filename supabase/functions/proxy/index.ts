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

// Process OpenAI chat
async function processOpenAIChat(messages: any[], functions: any[], apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
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

// Process Claude chat
async function processClaudeChat(messages: any[], functions: any[], apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      messages: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      tools: functions.map(fn => ({
        type: 'function',
        function: {
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters
        }
      })),
      max_tokens: 4096,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Claude API failed with status ${response.status}`);
  }

  return await response.json();
}

// Process Gemini chat
async function processGeminiChat(messages: any[], functions: any[], apiKey: string) {
  const systemMessage = messages.find(m => m.role === 'system');
  const otherMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        ...(systemMessage ? [{
          role: 'user',
          parts: [{ text: `System Instructions: ${systemMessage.content}` }]
        }] : []),
        ...otherMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      ],
      tools: [{
        function_declarations: functions
      }],
      generation_config: {
        temperature: 0.7,
        top_p: 0.8,
        top_k: 40,
        max_output_tokens: 4096
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Gemini API failed with status ${response.status}`);
  }

  return await response.json();
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

    // Get appropriate API key based on LLM engine
    const apiKey = (() => {
      switch (agent.llm_engine) {
        case 'gpt-4': return credentials.openai;
        case 'claude': return credentials.claude;
        case 'gemini': return credentials.gemini;
        default: return credentials.openai;
      }
    })();

    if (!apiKey) {
      throw new Error(`API key not found for ${agent.llm_engine}`);
    }

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

      // Construct messages array
      const conversationHistory = currentSession.conversation_history || [];
      conversationHistory.push({ role: 'user', content: message });

      // Process message based on LLM engine
      let response;
      try {
        switch (agent.llm_engine) {
          case 'gpt-4':
            response = await processOpenAIChat(conversationHistory, tools, apiKey);
            break;
          case 'claude':
            response = await processClaudeChat(conversationHistory, tools, apiKey);
            break;
          case 'gemini':
            response = await processGeminiChat(conversationHistory, tools, apiKey);
            break;
          default:
            throw new Error(`Unsupported LLM engine: ${agent.llm_engine}`);
        }
      } catch (error) {
        throw new Error(`LLM API Error: ${error.message}`);
      }

      // Handle function calls
      let finalResponse = '';
      if (response.choices?.[0]?.message?.function_call) {
        const functionCall = response.choices[0].message.function_call;
        const tool = tools.find(t => 
          t.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') === functionCall.name
        );

        if (tool) {
          const args = JSON.parse(functionCall.arguments);
          const functionResult = await executeToolFunction(tool, args);

          // Add function call and result to conversation
          conversationHistory.push({
            role: 'assistant',
            content: null,
            function_call: functionCall
          });
          conversationHistory.push({
            role: 'function',
            name: functionCall.name,
            content: JSON.stringify(functionResult)
          });

          // Get final response
          const finalLLMResponse = await processOpenAIChat(conversationHistory, tools, apiKey);
          finalResponse = finalLLMResponse.choices[0].message.content;
        }
      } else {
        finalResponse = response.choices[0].message.content;
      }

      // Add assistant response to conversation
      conversationHistory.push({ role: 'assistant', content: finalResponse });

      // Generate audio if Botnoi token exists
      let audioUrl = null;
      if (credentials.botnoi) {
        try {
          const botnoiResponse = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
            method: 'POST',
            headers: {
              'Botnoi-Token': credentials.botnoi,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: finalResponse.trim(),
              speaker: "1",
              volume: 1,
              speed: 1,
              type_media: "mp3",
              save_file: true,
              language: "th"
            })
          });

          if (botnoiResponse.ok) {
            const botnoiData = await botnoiResponse.json();
            audioUrl = botnoiData.audio_url;
          }
        } catch (error) {
          console.error('Botnoi API Error:', error);
        }
      }

      // Update session
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
          audio_url: audioUrl
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
    
    // Initialize conversation history
    const conversationHistory = [];
    
    // Add system prompt
    const faqSection = agent.faqs?.length > 0
      ? `\nKnowledge Base (HIGHEST PRIORITY):
${agent.faqs.map((faq: any) => 
  `Question: ${faq.question}
Answer: ${faq.answer}`
).join('\n\n')}\n\nIMPORTANT: When a user's question matches or is similar to any FAQ above:
1. Use the FAQ answer as your primary source of information
2. Give the exact answer to that FAQ question without any modification
3. Prioritize FAQ knowledge over other responses, don't even try to modify the defined answer`
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

    conversationHistory.push({ role: 'system', content: systemPrompt });

    // Create new session
    const { data: session, error: sessionError } = await supabase
      .from('shared_sessions')
      .insert({
        agent_id: agentId,
        session_id: sessionId,
        message_count: 0,
        daily_usage: 0,
        session_quota: agent.session_quota,
        conversation_history: conversationHistory,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Generate audio for greeting if Botnoi token is available
    let greetingAudioUrl = null;
    if (agent.greeting && credentials.botnoi) {
      try {
        const botnoiResponse = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
          method: 'POST',
          headers: {
            'Botnoi-Token': credentials.botnoi,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: agent.greeting.trim(),
            speaker: "1",
            volume: 1,
            speed: 1,
            type_media: "mp3",
            save_file: true,
            language: "th"
          })
        });

        if (botnoiResponse.ok) {
          const botnoiData = await botnoiResponse.json();
          greetingAudioUrl = botnoiData.audio_url;
        }
      } catch (error) {
        console.error('Failed to generate greeting audio:', error);
      }
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
          greeting: agent.greeting,
          session_quota: agent.session_quota,
          llm_engine: agent.llm_engine
        },
        greeting: agent.greeting,
        greeting_audio_url: greetingAudioUrl
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