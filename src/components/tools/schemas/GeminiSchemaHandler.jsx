import React from 'react';
import { toast } from 'react-hot-toast';

export default function GeminiSchemaHandler({
  formData,
  schemaEditorValue,
  setSchemaEditorValue,
  isTestingSchema,
  setIsTestingSchema,
  schemaTestResult,
  setSchemaTestResult,
  handleTest
}) {
  const MODEL_INFO = {
    name: 'Gemini',
    version: 'Gemini-1.5-Pro'
  };

  const generateSchema = () => {
    try {
      const inputSchema = JSON.parse(formData.input.schema);
      const outputSchema = JSON.parse(formData.output.schema);

      const schema = {
        tools: [{
          functionDeclarations: [{
            name: formData.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
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
                  default: JSON.parse(formData.headers || '{}')
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

      setSchemaEditorValue(JSON.stringify(schema, null, 2));
    } catch (error) {
      toast.error('Failed to generate Gemini schema: ' + error.message);
    }
  };

  const testSchema = async () => {
    try {
      setIsTestingSchema(true);
      setSchemaTestResult(null);

      const schema = JSON.parse(schemaEditorValue);
      const toolFunction = schema.tools[0].functionDeclarations[0];
      const functionCall = {
        name: toolFunction.name,
        arguments: JSON.stringify({
          api_url: formData.endpoint,
          method: formData.method,
          params: { query: 'test_query' }
        })
      };

      // Test the function call
      const result = await handleTest(functionCall);
      setSchemaTestResult({
        success: true,
        model: MODEL_INFO,
        functionCall,
        response: result
      });
      toast.success('Schema test successful!');
    } catch (error) {
      console.error('Schema test error:', error);
      setSchemaTestResult({
        success: false,
        model: MODEL_INFO,
        error: error.message
      });
      toast.error(`Schema test failed: ${error.message}`);
    } finally {
      setIsTestingSchema(false);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={generateSchema}
          className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
        >
          Generate Gemini Schema
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
              onChange={(e) => setSchemaEditorValue(e.target.value)}
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
            <span className="ml-2 text-xs font-normal text-gray-500">
              Using {schemaTestResult.model.name} ({schemaTestResult.model.version})
            </span>
          </h3>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
            {JSON.stringify(schemaTestResult, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}