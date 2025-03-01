import React from 'react';
import { toast } from 'react-hot-toast';

export default function OpenAISchemaHandler({
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
    name: 'OpenAI',
    version: 'GPT-4-0125-preview'
  };

  const generateSchema = () => {
    try {
      const inputSchema = JSON.parse(formData.input.schema);
      const outputSchema = JSON.parse(formData.output.schema);

      const schema = {
        openapi: '3.0.0',
        info: {
          title: formData.name,
          description: formData.description,
          version: '1.0.0'
        },
        paths: {
          '/': {
            [formData.method.toLowerCase()]: {
              operationId: formData.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
              description: formData.description,
              parameters: Object.entries(inputSchema.properties || {}).map(([name, schema]) => ({
                name,
                in: formData.method === 'GET' ? 'query' : 'body',
                required: (inputSchema.required || []).includes(name),
                schema
              })),
              responses: {
                '200': {
                  description: 'Successful response',
                  content: {
                    'application/json': {
                      schema: outputSchema
                    }
                  }
                }
              }
            }
          }
        }
      };

      setSchemaEditorValue(JSON.stringify(schema, null, 2));
    } catch (error) {
      toast.error('Failed to generate OpenAI schema: ' + error.message);
    }
  };

  const testSchema = async () => {
    try {
      setIsTestingSchema(true);
      setSchemaTestResult(null);

      const schema = JSON.parse(schemaEditorValue);
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

      const functionCall = {
        name: operation.operationId,
        arguments: JSON.stringify(testParams)
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
          Generate OpenAI Schema
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