import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/solid';

export default function DebugPanel({ debugData }) {
  if (!debugData) return null;

  const sections = [
    { title: 'Functions', data: debugData.functions },
    { title: 'Initial Request', data: debugData.initialRequest },
    { title: 'Initial Response', data: debugData.initialResponse },
    { title: 'Function Call', data: debugData.functionCall },
    { title: 'Function Result', data: debugData.functionResult },
    { title: 'Final Request', data: debugData.finalRequest },
    { title: 'Final Response', data: debugData.finalResponse },
    { title: 'Error', data: debugData.error }
  ].filter(section => section.data != null);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-700">
          <CodeBracketIcon className="h-5 w-5" />
          <h3 className="text-lg font-medium">Debug Information</h3>
        </div>
        <div className="text-sm text-gray-500">
          {debugData.timestamp}
        </div>
      </div>
      
      <div className="space-y-4">
        {sections.map(({ title, data }) => (
          <div key={title}>
            <h4 className="text-sm font-medium text-gray-600 mb-2">{title}:</h4>
            <pre className="bg-gray-50 p-3 rounded-lg overflow-auto max-h-60 text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}