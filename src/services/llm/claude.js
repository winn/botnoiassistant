import { supabaseAnonKey } from '../../lib/supabase';

export function formatToolForClaude(tool) {
  try {
    // Extract the actual function details
    const functionDetails = tool.function || tool;

    // Basic validation
    if (!functionDetails.name || !functionDetails.description) {
      console.error('Tool missing required properties:', tool);
      return null;
    }

    // Extract endpoint from parameters or description
    let endpoint = functionDetails.parameters?.properties?.api_url?.default;

    // If no endpoint found, try to extract from description
    if (!endpoint) {
      const endpointMatch = functionDetails.description.match(/Endpoint:\s*(https?:\/\/[^\s\n]+)/);
      if (endpointMatch) {
        endpoint = endpointMatch[1];
      }
    }

    // Create sanitized function name
    const sanitizedName = functionDetails.name
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/^[^a-z]/, 'fn_');

    return {
      type: 'function',
      function: {
        name: sanitizedName,
        description: functionDetails.description,
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Query parameter for the function'
            },
            api_url: {
              type: 'string',
              description: 'API endpoint URL',
              default: endpoint
            }
          },
          required: ['query']
        }
      }
    };
  } catch (error) {
    console.error('Error formatting tool for Claude:', error);
    return null;
  }
}


export async function processClaudeChat(messages, functions, apiKey, options = {}) {
  try {
    if (!apiKey) {
      throw new Error('Claude API key is required');
    }

    // Automatically add function call if system instructions suggest tool usage
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessage = messages.find(m => m.role === 'user');
    
    let autoFunctionCall = null;
    if (systemMessage && systemMessage.content.includes('ให้ใช้ tool')) {
      // Find the first tool in the functions array
      const firstTool = functions[0];
      if (firstTool) {
        const formattedTool = formatToolForClaude(firstTool);
        if (formattedTool) {
          autoFunctionCall = {
            name: formattedTool.function.name,
            arguments: JSON.stringify({ 
              query: userMessage.content,
              api_url: formattedTool.function.parameters.properties.api_url.default
            })
          };
        }
      }
    }

    // Format messages for Claude
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Format tools if provided
    let formattedTools;
    if (functions?.length > 0) {
      const toolFunctions = functions
        .map(fn => formatToolForClaude(fn))
        .filter(Boolean);

      if (toolFunctions.length > 0) {
        formattedTools = {
          type: 'function',
          functions: toolFunctions.map(tool => tool.function)
        };
      }
    }

    // Prepare request body
    const requestBody = {
      model: options.model || 'claude-3-haiku-20240307',
      messages: formattedMessages,
      tools: formattedTools,
      max_tokens: options.max_tokens || 4096,
      temperature: options.temperature || 0.7,
      stream: options.stream !== undefined ? options.stream : true
    };

    // If auto function call is needed, add it to the request
    if (autoFunctionCall) {
      requestBody.tool_choice = {
        type: 'function',
        function: { name: autoFunctionCall.name }
      };
    }

    // Make request to Edge Function proxy
    const response = await fetch('https://bkajnqaikyduvqkpbhzo.supabase.co/functions/v1/llm-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        engine: 'claude',
        apiKey,
        messages: formattedMessages,
        tools: formattedTools,
        tool_choice: autoFunctionCall ? {
          type: 'function',
          function: { name: autoFunctionCall.name }
        } : undefined,
        stream: requestBody.stream,
        model: requestBody.model,
        max_tokens: requestBody.max_tokens,
        temperature: requestBody.temperature
      })
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Claude proxy failed with status ${response.status}`);
    }

    return { response, requestBody, autoFunctionCall };
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

export function streamClaudeResponse(response) {
  return {
    [Symbol.asyncIterator]() {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      return {
        async next() {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              reader.releaseLock();
              return { done: true };
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;

              try {
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6));
                  
                  // Handle tool calls
                  if (data.type === 'tool_call') {
                    return {
                      value: JSON.stringify({
                        function_call: {
                          name: data.tool_call.name,
                          arguments: data.tool_call.arguments
                        }
                      }),
                      done: false
                    };
                  }

                  // Handle content deltas
                  if (data.type === 'content_block_delta' && data.delta?.text) {
                    return {
                      value: data.delta.text,
                      done: false
                    };
                  }

                  // Handle message stop
                  if (data.type === 'message_stop') {
                    reader.releaseLock();
                    return { done: true };
                  }
                }
              } catch (error) {
                console.error('Error parsing Claude stream:', error);
              }
            }
          }
        }
      };
    }
  };
}

export async function executeClaudeFunctionCall(functionName, functionArgs, tools) {
  try {
    // Find the matching tool
    const tool = tools.find(t => {
      const formattedTool = formatToolForClaude(t);
      return formattedTool?.function?.name === functionName;
    });

    if (!tool) {
      throw new Error(`Function ${functionName} not found in available tools`);
    }

    // Parse function arguments
    let parsedArgs;
    try {
      parsedArgs = typeof functionArgs === 'string' 
        ? JSON.parse(functionArgs) 
        : functionArgs;
    } catch (error) {
      console.error('Error parsing function arguments:', error);
      throw new Error(`Invalid function arguments for ${functionName}`);
    }

    // Extract endpoint from tool
    const formattedTool = formatToolForClaude(tool);
    const endpoint = parsedArgs.api_url || 
      formattedTool.function.parameters.properties.api_url.default;

    if (!endpoint) {
      throw new Error('No endpoint found for function call');
    }

    // Prepare request to the tool's endpoint
    const url = new URL(endpoint);
    
    // Add query parameter
    url.searchParams.append('query', parsedArgs.query);

    // Execute the function call
    const response = await fetch(url.toString(), {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Function call failed: ${errorText}`);
    }

    // Return parsed response
    return await response.json();
  } catch (error) {
    console.error(`Error executing function call for ${functionName}:`, error);
    throw error;
  }
}
