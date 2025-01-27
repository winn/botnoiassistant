import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function ToolModal({ isOpen, onClose, onSave, tool }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    input: {
      description: '',
      schema: '{}'
    },
    output: {
      description: '',
      schema: '{}'
    },
    method: 'GET',
    endpoint: '',
    headers: '{}',
    body: '{}'
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [schemaFormat, setSchemaFormat] = useState('openai');
  const [schemaEditorValue, setSchemaEditorValue] = useState('');
  const [isTestingSchema, setIsTestingSchema] = useState(false);
  const [schemaTestResult, setSchemaTestResult] = useState(null);

  useEffect(() => {
    if (tool) {
      setFormData(tool);
    } else {
      setFormData({
        name: '',
        description: '',
        input: {
          description: '',
          schema: '{}'
        },
        output: {
          description: '',
          schema: '{}'
        },
        method: 'GET',
        endpoint: '',
        headers: '{}',
        body: '{}'
      });
    }
    setTestResponse(null);
    setSchemaEditorValue('');
  }, [tool]);

  const handleTest = async (functionCall = null) => {
    try {
      if (!formData.endpoint) {
        throw new Error('Please provide an API endpoint');
      }

      setIsTesting(true);
      setTestResponse(null);

      // Parse headers and parameters
      const headers = JSON.parse(formData.headers || '{}');
      const params = functionCall ? 
        JSON.parse(functionCall.arguments) : 
        JSON.parse(formData.body || '{}');

      // Create URL with query parameters for GET requests
      const url = new URL(formData.endpoint);
      if (formData.method === 'GET') {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      // Prepare request configuration
      const requestConfig = {
        method: formData.method,
        headers: {
          'Accept': 'application/json',
          ...headers
        }
      };

      // Only add body for POST requests
      if (formData.method === 'POST') {
        requestConfig.headers['Content-Type'] = 'application/json';
        requestConfig.body = JSON.stringify(params);
      }

      // Make the request
      const response = await fetch(url.toString(), requestConfig);
      
      // Handle response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`API returned non-JSON response (${contentType || 'no content type'}): ${text}`);
      }

      const result = {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data
      };

      if (!functionCall) {
        setTestResponse(result);
      }

      if (response.ok) {
        if (!functionCall) {
          toast.success('API test successful!');
        }
        return result;
      } else {
        throw new Error(data.message || `API request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error testing API:', error);
      const errorResult = {
        error: true,
        message: error.message
      };

      if (!functionCall) {
        setTestResponse(errorResult);
        toast.error(error.message || 'Failed to test API');
      }
      throw error;
    } finally {
      if (!functionCall) {
        setIsTesting(false);
      }
    }
  };

  const testSchema = async () => {
    try {
      setIsTestingSchema(true);
      setSchemaTestResult(null);

      const schema = JSON.parse(schemaEditorValue);
      let functionCall;

      // Create test function call based on schema format
      switch (schemaFormat) {
        case 'openai': {
          const path = schema.paths['/'] || Object.values(schema.paths)[0];
          const operation = path[Object.keys(path)[0]];
          const parameters = operation.parameters || [];
          
          // Create test parameters
          const testParams = {};
          parameters.forEach(param => {
            switch (param.schema.type) {
              case 'string':
                testParams[param.name] = 'test_string';
                break;
              case 'number':
                testParams[param.name] = 123;
                break;
              case 'boolean':
                testParams[param.name] = true;
                break;
              default:
                testParams[param.name] = null;
            }
          });

          functionCall = {
            name: operation.operationId,
            arguments: JSON.stringify(testParams)
          };
          break;
        }
        
        case 'claude': {
          functionCall = {
            name: schema.function.name,
            arguments: JSON.stringify({
              query: 'test_query',
              api_url: formData.endpoint
            })
          };
          break;
        }

        case 'gemini': {
          const toolFunction = schema.tools[0].functionDeclarations[0];
          functionCall = {
            name: toolFunction.name,
            arguments: JSON.stringify({
              api_url: formData.endpoint,
              method: formData.method,
              params: { query: 'test_query' }
            })
          };
          break;
        }

        default:
          throw new Error(`Unsupported schema format: ${schemaFormat}`);
      }

      // Test the function call
      const result = await handleTest(functionCall);
      setSchemaTestResult({
        success: true,
        functionCall,
        response: result
      });
      toast.success('Schema test successful!');
    } catch (error) {
      console.error('Schema test error:', error);
      setSchemaTestResult({
        success: false,
        error: error.message
      });
      toast.error(`Schema test failed: ${error.message}`);
    } finally {
      setIsTestingSchema(false);
    }
  };

  const generateSchema = () => {
    try {
      const inputSchema = JSON.parse(formData.input.schema);
      const outputSchema = JSON.parse(formData.output.schema);
      const headers = JSON.parse(formData.headers);

      let schema;
      switch (schemaFormat) {
        case 'openai':
          schema = {
            openapi: "3.1.0",
            info: {
              title: formData.name,
              description: formData.description,
              version: "v1.0.0"
            },
            servers: [
              {
                url: formData.endpoint
              }
            ],
            paths: {
              "/": {
                [formData.method.toLowerCase()]: {
                  description: formData.description,
                  operationId: formData.name.replace(/[^a-zA-Z0-9]/g, ''),
                  parameters: Object.entries(inputSchema.properties || {}).map(([key, prop]) => ({
                    name: key,
                    in: formData.method === 'GET' ? 'query' : 'body',
                    description: prop.description || `The ${key} parameter`,
                    required: (inputSchema.required || []).includes(key),
                    schema: {
                      type: prop.type,
                      ...(prop.enum ? { enum: prop.enum } : {}),
                      ...(prop.default ? { default: prop.default } : {})
                    }
                  })),
                  responses: {
                    "200": {
                      description: formData.output.description || "Successful response",
                      content: {
                        "application/json": {
                          schema: outputSchema
                        }
                      }
                    }
                  },
                  deprecated: false
                }
              }
            },
            components: {
              schemas: {}
            }
          };

          // Add security if headers contain authorization
          if (headers.Authorization || headers.authorization) {
            schema.components.securitySchemes = {
              BearerAuth: {
                type: "http",
                scheme: "bearer"
              }
            };
            schema.security = [{ BearerAuth: [] }];
          }
          break;

        case 'claude':
          schema = {
            type: 'function',
            function: {
              name: formData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              description: formData.description,
              parameters: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: formData.input.description
                  },
                  api_url: {
                    type: 'string',
                    description: 'API endpoint URL',
                    default: formData.endpoint
                  }
                },
                required: ['query']
              }
            }
          };
          break;

        case 'gemini':
          schema = {
            tools: [{
              functionDeclarations: [{
                name: formData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                description: `${formData.description}\n\nEndpoint: ${formData.endpoint}`,
                parameters: {
                  type: "OBJECT",
                  properties: {
                    api_url: {
                      type: "STRING",
                      description: "API endpoint URL",
                      default: formData.endpoint
                    },
                    method: {
                      type: "STRING",
                      description: "HTTP method",
                      enum: ["GET", "POST"],
                      default: formData.method
                    },
                    headers: {
                      type: "OBJECT",
                      description: "Optional headers for the request",
                      default: headers
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
          break;
      }

      setSchemaEditorValue(JSON.stringify(schema, null, 2));
      toast.success(`${schemaFormat.toUpperCase()} schema generated successfully`);
    } catch (error) {
      console.error('Error generating schema:', error);
      toast.error('Failed to generate schema. Please check your input/output schemas.');
    }
  };

  const handleSchemaChange = (value) => {
    setSchemaEditorValue(value);
    try {
      const schema = JSON.parse(value);
      
      // Extract tool configuration based on schema format
      if (schemaFormat === 'openai' && schema.openapi) {
        const path = schema.paths['/'] || Object.values(schema.paths)[0];
        const method = Object.keys(path)[0].toUpperCase();
        const operation = path[Object.keys(path)[0]];
        const parameters = operation.parameters || [];
        
        // Build input schema from parameters
        const inputProperties = {};
        const required = [];
        parameters.forEach(param => {
          inputProperties[param.name] = {
            type: param.schema.type,
            description: param.description,
            ...(param.schema.enum ? { enum: param.schema.enum } : {}),
            ...(param.schema.default ? { default: param.schema.default } : {})
          };
          if (param.required) {
            required.push(param.name);
          }
        });

        // Extract output schema from responses
        const outputSchema = operation.responses['200']?.content?.['application/json']?.schema || {};

        // Update form data
        setFormData(prev => ({
          ...prev,
          name: schema.info.title || prev.name,
          description: schema.info.description || prev.description,
          method,
          endpoint: schema.servers?.[0]?.url || prev.endpoint,
          input: {
            description: operation.description || prev.input.description,
            schema: JSON.stringify({ 
              type: 'object',
              properties: inputProperties,
              required
            }, null, 2)
          },
          output: {
            description: operation.responses['200']?.description || prev.output.description,
            schema: JSON.stringify(outputSchema, null, 2)
          }
        }));
      }
    } catch (error) {
      console.error('Error parsing schema:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    toast.success(tool ? 'Tool updated successfully' : 'Tool added successfully');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">
                  {tool ? 'Edit Tool' : 'Add New Tool'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tool Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="Enter tool name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      rows="2"
                      placeholder="Describe what this tool does"
                    />
                  </div>
                </div>

                {/* Input/Output */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Input Description
                      </label>
                      <textarea
                        value={formData.input.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          input: { ...formData.input, description: e.target.value }
                        })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        rows="2"
                        placeholder="Describe the required input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Input Schema (JSON)
                      </label>
                      <textarea
                        value={formData.input.schema}
                        onChange={(e) => setFormData({
                          ...formData,
                          input: { ...formData.input, schema: e.target.value }
                        })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
                        rows="4"
                        placeholder="{}"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Output Description
                      </label>
                      <textarea
                        value={formData.output.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          output: { ...formData.output, description: e.target.value }
                        })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        rows="2"
                        placeholder="Describe the expected output"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Output Schema (JSON)
                      </label>
                      <textarea
                        value={formData.output.schema}
                        onChange={(e) => setFormData({
                          ...formData,
                          output: { ...formData.output, schema: e.target.value }
                        })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
                        rows="4"
                        placeholder="{}"
                      />
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-1/4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Method
                      </label>
                      <select
                        value={formData.method}
                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Endpoint
                      </label>
                      <input
                        type="text"
                        value={formData.endpoint}
                        onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="https://api.example.com/endpoint"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Headers (JSON)
                    </label>
                    <textarea
                      value={formData.headers}
                      onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
                      rows="3"
                      placeholder="{}"
                    />
                  </div>
                  {formData.method === 'POST' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Template (JSON)
                      </label>
                      <textarea
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
                        rows="3"
                        placeholder="{}"
                      />
                    </div>
                  )}
                </div>

                {/* Schema Generation */}
                <div className="space-y-4">
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schema Format
                      </label>
                      <select
                        value={schemaFormat}
                        onChange={(e) => setSchemaFormat(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="claude">Claude</option>
                        <option value="gemini">Gemini</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={generateSchema}
                      className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
                    >
                      Generate Schema
                    </button>
                  </div>
                  
                  {schemaEditorValue && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Generated Schema
                        </label>
                        <textarea
                          value={schemaEditorValue}
                          onChange={(e) => handleSchemaChange(e.target.value)}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
                          rows="8"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={testSchema}
                          disabled={isTestingSchema}
                          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isTestingSchema ? 'Testing...' : 'Test Schema'}
                        </button>
                      </div>
                    </>
                  )}

                  {schemaTestResult && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Schema Test Result
                      </h3>
                      <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
                        {JSON.stringify(schemaTestResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Test Response */}
                {testResponse && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Test Response
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-60">
                      {testResponse.error ? (
                        <div className="text-red-600 font-mono text-sm whitespace-pre-wrap">
                          Error: {testResponse.message}
                        </div>
                      ) : (
                        <div className="font-mono text-sm space-y-2">
                          <div className="text-gray-600">
                            Status: <span className="text-gray-900">{testResponse.status}</span>
                          </div>
                          <div className="text-gray-600">
                            Headers:
                            <pre className="text-gray-900 whitespace-pre-wrap">
                              {JSON.stringify(testResponse.headers, null, 2)}
                            </pre>
                          </div>
                          <div className="text-gray-600">
                            Response:
                            <pre className="text-gray-900 whitespace-pre-wrap">
                              {JSON.stringify(testResponse.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {isTesting ? 'Testing...' : 'Test API'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    {tool ? 'Update Tool' : 'Add Tool'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}