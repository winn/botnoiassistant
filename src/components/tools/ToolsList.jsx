import React from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

export default function ToolsList({ tools, onAddTool, onEditTool, onDeleteTool }) {
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
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-1 cursor-pointer" onClick={() => onEditTool(tool)}>
              <h4 className="font-medium text-gray-800">{tool.name}</h4>
              <p className="text-sm text-gray-500">{tool.description}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEditTool(tool)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                title="Edit tool"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDeleteTool?.(tool.id)}
                className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                title="Delete tool"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}