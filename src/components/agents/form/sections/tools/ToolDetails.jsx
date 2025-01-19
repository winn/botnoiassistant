import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

export default function ToolDetails({ tool }) {
  return (
    <div className="mt-3 bg-sky-50 p-3 rounded-lg">
      <div className="flex items-start space-x-2">
        <InformationCircleIcon className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-sky-700">
          <div className="font-medium mb-1">Input Required:</div>
          <p>{tool.input.description}</p>
          <div className="font-medium mt-2 mb-1">Output:</div>
          <p>{tool.output.description}</p>
        </div>
      </div>
    </div>
  );
}