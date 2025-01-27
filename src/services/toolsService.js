import { toast } from 'react-hot-toast';

export function convertToolToFunction(tool, llmEngine = 'gpt-4') {
  try {
    // Validate required tool properties
    if (!tool || !tool.name || !tool.endpoint) {
      console.error('Tool missing required properties:', tool);
      return null;
    }

    // Use the appropriate formatter based on LLM engine
    switch (llmEngine) {
      case 'claude':
        return import('./llm/claude').then(m => m.formatToolForClaude(tool));
      case 'gemini':
        return import('./llm/gemini').then(m => m.formatToolForGemini(tool));
      case 'gpt-4':
      default:
        return import('./llm/openai').then(m => m.formatToolForOpenAI(tool));
    }
  } catch (error) {
    console.error('Error converting tool to function:', error);
    return null;
  }
}

export async function executeToolFunction(tool, parameters) {
  try {
    const headers = typeof tool.headers === 'string' 
      ? JSON.parse(tool.headers) 
      : tool.headers || {};

    const requestConfig = {
      method: parameters.method || tool.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers,
        ...parameters.headers
      }
    };

    const url = new URL(parameters.api_url || tool.endpoint);
    
    // Add query parameters if provided
    if (parameters.params) {
      Object.entries(parameters.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    if (requestConfig.method === 'POST') {
      requestConfig.headers['Content-Type'] = 'application/json';
      const bodyTemplate = typeof tool.body === 'string'
        ? JSON.parse(tool.body)
        : tool.body || {};

      const processedBody = JSON.stringify(bodyTemplate).replace(
        /{{\s*([^}]+)\s*}}/g,
        (_, key) => JSON.stringify(parameters[key])
      );
      requestConfig.body = processedBody;
    }

    const response = await fetch(url.toString(), requestConfig);
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
      output: data
    };
  } catch (error) {
    console.error('Error executing tool function:', error);
    return {
      success: false,
      error: error.message,
      tool_name: tool.name
    };
  }
}

export async function processChatWithFunctions(messages, tools, apiKey, onStream, llmEngine = 'gpt-4') {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const validMessages = messages.filter(msg => msg.content != null);
    
    // Convert tools to functions with proper error handling
    const functionsPromises = tools.map(tool => convertToolToFunction(tool, llmEngine));
    const functions = (await Promise.all(functionsPromises)).filter(Boolean);

    const debug = {
      timestamp: new Date().toISOString(),
      messages: validMessages,
      functions,
      initialRequest: null,
      initialResponse: null,
      functionCall: null,
      functionResult: null,
      finalRequest: null,
      finalResponse: null,
      error: null
    };

    let response, requestBody;

    // Process chat based on LLM engine
    try {
      switch (llmEngine) {
        case 'gpt-4': {
          const { processOpenAIChat } = await import('./llm/openai');
          ({ response, requestBody } = await processOpenAIChat(validMessages, functions, apiKey));
          break;
        }
        case 'claude': {
          const { processClaudeChat } = await import('./llm/claude');
          ({ response, requestBody } = await processClaudeChat(validMessages, functions, apiKey));
          break;
        }
        case 'gemini': {
          const { processGeminiChat } = await import('./llm/gemini');
          ({ response, requestBody } = await processGeminiChat(validMessages, functions, apiKey));
          break;
        }
        default:
          throw new Error(`Unsupported LLM engine: ${llmEngine}`);
      }
    } catch (error) {
      debug.error = error;
      throw error;
    }

    debug.initialRequest = requestBody;

    // Handle function calls
    let fullResponse = '';
    let functionCallResult = null;
    let functionCallData = null;

    try {
      const streamGenerator = await (async () => {
        switch (llmEngine) {
          case 'gpt-4': {
            const { streamOpenAIResponse } = await import('./llm/openai');
            return streamOpenAIResponse(response);
          }
          case 'claude': {
            const { streamClaudeResponse } = await import('./llm/claude');
            return streamClaudeResponse(response);
          }
          case 'gemini': {
            const { streamGeminiResponse } = await import('./llm/gemini');
            return streamGeminiResponse(response);
          }
          default:
            throw new Error(`Unsupported LLM engine: ${llmEngine}`);
        }
      })();

      for await (const chunk of streamGenerator) {
        if (typeof chunk === 'string' && chunk.startsWith('{')) {
          try {
            const parsed = JSON.parse(chunk);
            if (parsed.function_call) {
              functionCallData = parsed.function_call;
              debug.functionCall = functionCallData;

              // Find and execute the tool
              const tool = tools.find(t => 
                t.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') === functionCallData.name
              );

              if (tool) {
                const args = JSON.parse(functionCallData.arguments);
                functionCallResult = await executeToolFunction(tool, args);
                debug.functionResult = functionCallResult;

                // Add function call and result to messages
                validMessages.push({
                  role: 'assistant',
                  content: null,
                  function_call: functionCallData
                });
                validMessages.push({
                  role: 'function',
                  name: functionCallData.name,
                  content: JSON.stringify(functionCallResult)
                });

                // Make another request to process function result
                const finalResponse = await processChatWithFunctions(
                  validMessages,
                  tools,
                  apiKey,
                  onStream,
                  llmEngine
                );

                fullResponse = finalResponse.response;
                debug.finalResponse = finalResponse.debug.finalResponse;
                break;
              }
            }
          } catch (e) {
            // Not a function call, treat as regular text
            fullResponse += chunk;
            onStream?.(chunk);
          }
        } else {
          fullResponse += chunk;
          onStream?.(chunk);
        }
      }
    } catch (error) {
      debug.error = error;
      throw error;
    }

    if (!functionCallResult) {
      debug.finalResponse = {
        choices: [{
          message: {
            role: 'assistant',
            content: fullResponse
          }
        }]
      };
    }

    return {
      response: fullResponse,
      functionCall: functionCallResult ? {
        name: functionCallData.name,
        args: JSON.parse(functionCallData.arguments),
        result: functionCallResult
      } : null,
      debug
    };

  } catch (error) {
    console.error('Error processing chat with functions:', error);
    toast.error(error.message || 'Failed to process request');
    throw error;
  }
}