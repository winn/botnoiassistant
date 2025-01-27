import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Request received:', req.method, req.url);
    
    const body = await req.json();
    const { engine, apiKey, messages, contents, tools, generation_config, safety_settings, stream = true } = body;

    console.log('Request details:', {
      engine,
      hasApiKey: Boolean(apiKey),
      messagesCount: messages?.length,
      contentsCount: contents?.length,
      toolsCount: tools?.length,
      stream
    });

    if (!apiKey) {
      throw new Error('API key is required');
    }

    let response;
    try {
      switch (engine) {
        case 'gpt-4': {
          console.log('Making OpenAI API request...');
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages,
              functions: tools,
              function_call: tools?.length ? 'auto' : undefined,
              temperature: 0.7,
              stream: true
            })
          });
          break;
        }

        case 'gemini':
          console.log('Making Gemini API request...');
          response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents,
              tools,
              generationConfig: generation_config,
              safetySettings: safety_settings
            })
          });

          // For Gemini, return the response directly without streaming
          if (response.ok) {
            const data = await response.json();
            return new Response(JSON.stringify(data), {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          break;

        case 'claude':
          console.log('Making Claude API request...');
          
          // Format tools for Claude if provided
          const claudeTools = tools?.length > 0 ? {
            type: 'function',
            functions: tools[0].functions // Extract the functions array directly
          } : undefined;

          const claudeBody = {
            model: 'claude-3-haiku-20240307',
            messages,
            tools: claudeTools,
            max_tokens: 4096,
            temperature: 0.7,
            stream: true
          };

          console.log('Claude request body:', claudeBody);
          
          response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
              'x-api-key': apiKey
            },
            body: JSON.stringify(claudeBody)
          });
          break;

        default:
          throw new Error(`Unsupported LLM engine: ${engine}`);
      }

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error response:', errorData);
        throw new Error(errorData.error?.message || `${engine} API request failed with status ${response.status}`);
      }

      // Stream the response back for non-Gemini engines
      const { readable, writable } = new TransformStream();
      response.body?.pipeTo(writable);

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });

    } catch (apiError) {
      console.error(`${engine} API Error:`, apiError);
      throw apiError;
    }

  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Internal server error',
          type: 'proxy_error',
          code: 500
        }
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});