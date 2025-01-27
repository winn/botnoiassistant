import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TestOpenAI({ apiKey }) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say hello!' }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data);
      toast.success('OpenAI API test successful!');
    } catch (error) {
      console.error('OpenAI API Error:', error);
      setError(error.message);
      toast.error(`OpenAI API Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">OpenAI API Test</h2>
        <button
          onClick={testApi}
          disabled={isLoading || !apiKey}
          className={`px-4 py-2 rounded-lg ${
            isLoading || !apiKey
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-600 text-white'
          }`}
        >
          {isLoading ? 'Testing...' : 'Test API'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {response && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          <p className="font-medium">Success! Response:</p>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {!apiKey && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
          Please enter your OpenAI API key in settings first.
        </div>
      )}
    </div>
  );
}