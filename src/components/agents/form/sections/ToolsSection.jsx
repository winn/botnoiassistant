import React from 'react';
import { motion } from 'framer-motion';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

export default function ToolsSection({ 
  tools = [], 
  selectedTools = [], 
  onChange 
}) {
  const toggleTool = (toolId) => {
    onChange(
      selectedTools.includes(toolId)
        ? selectedTools.filter(id => id !== toolId)
        : [...selectedTools, toolId]
    );
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Available Tools
        </label>
        <p className="text-sm text-gray-500 mt-1">
          Select the tools this agent can use when responding to users
        </p>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto p-2 border rounded-lg">
        {tools.map(tool => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center h-5 pt-1">
              <input
                type="checkbox"
                id={`tool-${tool.id}`}
                checked={selectedTools.includes(tool.id)}
                onChange={() => toggleTool(tool.id)}
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

              {selectedTools.includes(tool.id) && (
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
              )}
            </div>
          </motion.div>
        ))}

        {tools.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No tools available</p>
            <p className="text-sm text-gray-400 mt-1">
              Add tools in the Tools section first
            </p>
          </div>
        )}
      </div>
    </div>
  );
}