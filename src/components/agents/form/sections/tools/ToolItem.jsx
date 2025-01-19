import React from 'react';
import ToolDetails from './ToolDetails';

export default function ToolItem({ tool, isSelected, onToggle }) {
  return (
    <div className="p-3 hover:bg-gray-50 rounded-lg border">
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5 pt-1">
          <input
            type="checkbox"
            id={`tool-${tool.id}`}
            checked={isSelected}
            onChange={onToggle}
            className="h-4 w-4 text-sky-500 rounded border-gray-300 focus:ring-sky-500"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor={`tool-${tool.id}`}
            className="block cursor-pointer"
          >
            <div className="font-medium text-gray-700">{tool.name}</div>
            <div className="text-sm text-gray-500 mt-1">{tool.description}</div>
          </label>

          {isSelected && <ToolDetails tool={tool} />}
        </div>
      </div>
    </div>
  );
}