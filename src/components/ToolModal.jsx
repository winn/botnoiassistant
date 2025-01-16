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
  }, [tool]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    toast.success(tool ? 'Tool updated successfully' : 'Tool added successfully');
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResponse(null);
      
      if (!formData.endpoint) {
        throw new Error('Please provide an API endpoint');
      }

      let headers = {};
      let body = {};
      let inputSchema = {};

      try {
        headers = JSON.parse(formData.headers || '{}');
      } catch (e) {
        throw new Error('Invalid JSON in Headers field');
      }

      try {
        body = JSON.parse(formData.body || '{}');
      } catch (e) {
        throw new Error('Invalid JSON in Body Template field');
      }

      try {
        inputSchema = JSON.parse(formData.input.schema || '{}');
      } catch (e) {
        throw new Error('Invalid JSON in Input Schema field');
      }
      
      const testData = {};
      Object.keys(inputSchema.properties || {}).forEach(key => {
        const prop = inputSchema.properties[key];
        switch (prop.type) {
          case 'string':
            testData[key] = 'test_string';
            break;
          case 'number':
            testData[key] = 123;
            break;
          case 'boolean':
            testData[key] = true;
            break;
          case 'array':
            testData[key] = [];
            break;
          case 'object':
            testData[key] = {};
            break;
          default:
            testData[key] = null;
        }
      });

      const processedBody = JSON.stringify(body).replace(
        /{{\s*([^}]+)\s*}}/g,
        (_, key) => JSON.stringify(testData[key])
      );

      const requestConfig = {
        method: formData.method,
        headers: {
          'Accept': 'application/json',
          ...headers
        }
      };

      if (formData.method === 'POST') {
        requestConfig.headers['Content-Type'] = 'application/json';
        requestConfig.body = processedBody;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      requestConfig.signal = controller.signal;

      try {
        const response = await fetch(formData.endpoint, requestConfig);
        clearTimeout(timeout);

        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
          throw new Error(`API returned non-JSON response (${contentType || 'no content type'})`);
        }
        
        setTestResponse({
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          data
        });

        if (response.ok) {
          toast.success('API test successful!');
        } else {
          throw new Error(
            data.message || 
            `API request failed with status ${response.status}`
          );
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out after 10 seconds');
        }
        throw error;
      }
    } catch (error) {
      setTestResponse({
        error: true,
        message: error.message
      });
      toast.error(error.message || 'Failed to test API');
    } finally {
      setIsTesting(false);
    }
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