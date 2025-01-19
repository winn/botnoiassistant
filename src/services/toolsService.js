import { toast } from 'react-hot-toast';

export function convertToolToFunction(tool) {
  try {
    let inputSchema;
    try {
      inputSchema = typeof tool.input.schema === 'string' 
        ? JSON.parse(tool.input.schema)
        : tool.input.schema;
    } catch (e) {
      console.error('Invalid input schema:', e);
      toast.error('Invalid input schema format');
      return null;
    }

    if (!inputSchema.properties || typeof inputSchema.properties !== 'object') {
      inputSchema = {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: tool.input.description || 'Input query'
          }
        },
        required: ['query']
      };
    }

    const sanitizedName = tool.name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/^[^a-z]/, 'fn_');

    return {
      name: sanitizedName,
      description: `${tool.description}\n\nInput: ${tool.input.description}\nOutput: ${tool.output.description}`,
      parameters: {
        type: 'object',
        properties: inputSchema.properties,
        required: inputSchema.required || Object.keys(inputSchema.properties)
      }
    };
  } catch (error) {
    console.error('Error converting tool to function:', error);
    toast.error('Invalid tool configuration');
    return null;
  }
}

export async function executeToolFunction(tool, parameters) {
  try {
    const headers = JSON.parse(tool.headers || '{}');
    const requestConfig = {
      method: tool.method,
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };

    if (tool.method === 'POST') {
      requestConfig.headers['Content-Type'] = 'application/json';
      const bodyTemplate = JSON.parse(tool.body_template || '{}');
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

async function* streamResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;

        try {
          const json = JSON.parse(line.replace(/^data: /, ''));
          const content = json.choices[0]?.delta?.content || '';
          if (content) {
            yield content;
          }
        } catch (error) {
          console.error('Error parsing stream:', error);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function processChatWithFunctions(messages, tools, apiKey, onStream) {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }

    const validMessages = messages.filter(msg => msg.content != null);

    const debug = {
      timestamp: new Date().toISOString(),
      messages: validMessages,
      functions: null,
      initialRequest: null,
      initialResponse: null,
      functionCall: null,
      functionResult: null,
      finalRequest: null,
      finalResponse: null,
      error: null
    };

    const functions = tools
      .map(convertToolToFunction)
      .filter(Boolean);

    debug.functions = functions;

    // First request to check for function calls
    const initialRequest = {
      model: 'gpt-4o-mini',
      messages: validMessages,
      temperature: 0.7,
      stream: false,
      ...(functions.length > 0 && {
        functions,
        function_call: 'auto'
      })
    };

    debug.initialRequest = initialRequest;

    const initialResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(initialRequest)
    });

    if (!initialResponse.ok) {
      const errorData = await initialResponse.json().catch(() => null);
      const error = new Error(
        errorData?.error?.message || 
        `OpenAI API failed with status ${initialResponse.status}`
      );
      debug.error = error;
      throw error;
    }

    const initialResult = await initialResponse.json();
    debug.initialResponse = initialResult;

    const message = initialResult.choices[0].message;
    let fullResponse = '';

    // Handle function calling if needed
    if (message.function_call) {
      debug.functionCall = message.function_call;

      const functionName = message.function_call.name;
      const tool = tools.find(t => 
        t.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/^[^a-z]/, 'fn_') === functionName
      );

      if (!tool) {
        const error = new Error(`Function ${functionName} not found in tools`);
        debug.error = error;
        throw error;
      }

      const args = JSON.parse(message.function_call.arguments);
      const functionResult = await executeToolFunction(tool, args);
      debug.functionResult = functionResult;

      validMessages.push(message);
      validMessages.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult)
      });
    }

    // Make final streaming request
    const finalRequest = {
      model: 'gpt-4o-mini',
      messages: validMessages,
      temperature: 0.7,
      stream: true
    };

    debug.finalRequest = finalRequest;

    const streamingResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finalRequest)
    });

    if (!streamingResponse.ok) {
      const errorData = await streamingResponse.json().catch(() => null);
      const error = new Error(
        errorData?.error?.message || 
        `OpenAI API failed with status ${streamingResponse.status}`
      );
      debug.error = error;
      throw error;
    }

    for await (const chunk of streamResponse(streamingResponse)) {
      fullResponse += chunk;
      onStream?.(chunk);
    }

    debug.finalResponse = {
      choices: [{
        message: {
          role: 'assistant',
          content: fullResponse
        }
      }]
    };

    return {
      response: fullResponse,
      functionCall: message.function_call ? {
        name: message.function_call.name,
        args: JSON.parse(message.function_call.arguments),
        result: debug.functionResult
      } : null,
      debug
    };

  } catch (error) {
    console.error('Error processing chat with functions:', error);
    toast.error(error.message);
    throw error;
  }
}