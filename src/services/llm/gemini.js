import { supabaseAnonKey } from '../../lib/supabase';

export function formatToolForGemini(tool) {
  try {
    // Validate required tool properties
    if (!tool || !tool.name || !tool.endpoint) {
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
      if (!inputSchema || typeof inputSchema !== 'object') {
        throw new Error('Invalid input schema format');
      }
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

    // Format for Gemini's expected structure
    return {
      tools: [{
        functionDeclarations: [{
          name: sanitizedName,
          description: `${tool.description || ''}\n\nEndpoint: ${tool.endpoint}`,
          parameters: {
            type: "OBJECT",
            properties: {
              api_url: {
                type: "STRING",
                description: "API endpoint URL",
                default: tool.endpoint
              },
              method: {
                type: "STRING",
                description: "HTTP method",
                enum: ["GET", "POST"],
                default: tool.method || "GET"
              },
              headers: {
                type: "OBJECT",
                description: "Optional headers for the request",
                default: typeof tool.headers === 'string' ? JSON.parse(tool.headers) : tool.headers || {}
              },
              params: {
                type: "OBJECT",
                description: "Optional query parameters or body data",
                default: {}
              }
            },
            required: ["api_url"]
          }
        }]
      }]
    };
  } catch (error) {
    console.error('Error formatting tool for Gemini:', error);
    return null;
  }
}

export async function processGeminiChat(messages, functions, apiKey) {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    // Format system message
    const systemMessage = messages.find(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');

    // Format messages array
    const formattedContents = [
      // Add system message first if it exists
      ...(systemMessage ? [{
        role: 'user',
        parts: [{ text: `System Instructions: ${systemMessage.content}` }]
      }] : []),
      // Add other messages
      ...otherMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    // Format tools if provided
    const formattedTools = functions?.length > 0 
      ? functions.map(fn => formatToolForGemini(fn)).filter(Boolean)
      : undefined;

    // Prepare request body
    const requestBody = {
      contents: formattedContents,
      tools: formattedTools,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
        candidateCount: 1
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Make request to our Edge Function proxy
    const response = await fetch('https://bkajnqaikyduvqkpbhzo.supabase.co/functions/v1/llm-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        engine: 'gemini',
        apiKey,
        contents: formattedContents,
        tools: formattedTools,
        generation_config: requestBody.generationConfig,
        safety_settings: requestBody.safetySettings,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Gemini API failed with status ${response.status}`);
    }

    return { response, requestBody };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

export async function* streamGeminiResponse(response) {
  try {
    const data = await response.json();
    console.log('Gemini Response:', data);

    // Handle function call
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    if (functionCall) {
      yield JSON.stringify({
        function_call: {
          name: functionCall.name,
          arguments: JSON.stringify({
            query: functionCall.args?.query || ''
          })
        }
      });
      return;
    }

    // Handle text content
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      yield text;
    } else {
      console.warn('No text content found in Gemini response');
      yield ''; // Return empty string to avoid undefined
    }

    // Handle errors
    if (data.error) {
      throw new Error(data.error.message || 'Error in Gemini response');
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw error;
  }
}