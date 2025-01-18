import React from 'react';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/solid';

export default function ToolsList({ tools, onAddTool, onEditTool }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700">Function Tools</h3>
        <button
          onClick={onAddTool}
          className="p-2 rounded-lg hover:bg-sky-100 text-sky-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEditTool(tool)}
          >
            <div>
              <h4 className="font-medium text-gray-800">{tool.name}</h4>
              <p className="text-sm text-gray-500">{tool.description}</p>
            </div>
            <PencilIcon className="h-4 w-4 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}