import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/solid';

export default function DebugPanel({ data }) {
  if (!data) return null;

  const sections = [
    { title: 'Functions', data: data.functions },
    { title: 'Initial Request', data: data.initialRequest },
    { title: 'Initial Response', data: data.initialResponse },
    { title: 'Function Call', data: data.functionCall },
    { title: 'Function Result', data: data.functionResult },
    { title: 'Final Request', data: data.finalRequest },
    { title: 'Final Response', data: data.finalResponse },
    { title: 'Error', data: data.error }
  ].filter(section => section.data != null);

  return (
    <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-700">
          <CodeBracketIcon className="h-5 w-5" />
          <h3 className="text-lg font-medium">Debug Information</h3>
        </div>
        <div className="text-sm text-gray-500">
          {data.timestamp}
        </div>
      </div>
      
      <div className="space-y-4">
        {sections.map(({ title, data }) => (
          <div key={title}>
            <h4 className="text-sm font-medium text-gray-600 mb-2">{title}:</h4>
            <pre className="bg-white p-3 rounded-lg overflow-auto max-h-60 text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}