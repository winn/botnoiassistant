import { supabaseAnonKey } from '../../lib/supabase';

export function formatToolForOpenAI(tool) {
  try {
    // Basic validation
    if (!tool?.name || !tool?.endpoint) {
      console.error('Tool missing required properties:', tool);
      return null;
    }

    // Create sanitized function name
    const sanitizedName = tool.name
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/^[^a-z]/, 'fn_');

    // Parse input schema safely
    let inputSchema;
    try {
      inputSchema = typeof tool.input === 'string' ? JSON.parse(tool.input) : tool.input;
    } catch (e) {
      console.error('Invalid input schema:', e);
      inputSchema = {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Input query'
          }
        },
        required: ['query']
      };
    }

    return {
      name: sanitizedName,
      description: `${tool.description}\n\nEndpoint: ${tool.endpoint}\n\nInput: ${tool.input?.description || 'Input query'}\nOutput: ${tool.output?.description || 'Function output'}`,
      parameters: {
        type: 'object',
        properties: {
          api_url: {
            type: 'string',
            description: 'API endpoint URL',
            default: tool.endpoint
          },
          method: {
            type: 'string',
            description: 'HTTP method',
            enum: ['GET', 'POST'],
            default: tool.method || 'GET'
          },
          headers: {
            type: 'object',
            description: 'Optional headers for the request',
            default: typeof tool.headers === 'string' ? JSON.parse(tool.headers) : tool.headers || {}
          },
          params: {
            type: 'object',
            description: 'Optional query parameters or body data',
            default: {}
          }
        },
        required: ['api_url']
      }
    };
  } catch (error) {
    console.error('Error formatting tool for OpenAI:', error);
    return null;
  }
}

export async function processOpenAIChat(messages, functions, apiKey) {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Make request to our Edge Function proxy
    const response = await fetch('https://bkajnqaikyduvqkpbhzo.supabase.co/functions/v1/llm-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        engine: 'gpt-4',
        apiKey,
        messages,
        tools: functions
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API failed with status ${response.status}`);
    }

    return { response, requestBody: { messages, functions } };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

export async function* streamOpenAIResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let functionCallBuffer = {
    name: '',
    arguments: ''
  };
  let inFunctionCall = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;

        try {
          if (line.startsWith('data: ')) {
            const json = JSON.parse(line.slice(6));
            const delta = json.choices?.[0]?.delta;

            if (delta?.function_call) {
              inFunctionCall = true;
              if (delta.function_call.name) {
                functionCallBuffer.name = delta.function_call.name;
              }
              if (delta.function_call.arguments) {
                functionCallBuffer.arguments += delta.function_call.arguments;
              }
              continue;
            }

            // If we were in a function call and now we're not, emit the complete function call
            if (inFunctionCall && !delta?.function_call && functionCallBuffer.name) {
              yield JSON.stringify({
                function_call: {
                  name: functionCallBuffer.name,
                  arguments: functionCallBuffer.arguments
                }
              });
              // Reset function call state
              inFunctionCall = false;
              functionCallBuffer = { name: '', arguments: '' };
              continue;
            }

            // Regular content
            if (delta?.content) {
              yield delta.content;
            }
          }
        } catch (error) {
          console.error('Error parsing OpenAI stream:', error);
        }
      }
    }

    // If we have a pending function call at the end, emit it
    if (inFunctionCall && functionCallBuffer.name) {
      yield JSON.stringify({
        function_call: {
          name: functionCallBuffer.name,
          arguments: functionCallBuffer.arguments
        }
      });
    }
  } finally {
    reader.releaseLock();
  }
}