import React from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

export default function AgentsList({ agents, onAddAgent, onEditAgent, onDeleteAgent, selectedAgentId, onSelectAgent }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700">Agents</h3>
        <button
          onClick={onAddAgent}
          className="p-2 rounded-lg hover:bg-sky-100 text-sky-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              selectedAgentId === agent.id ? 'ring-2 ring-sky-500' : ''
            }`}
            onClick={() => onSelectAgent(agent.id)}
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-800">{agent.name}</h4>
              <p className="text-sm text-gray-500 truncate break-words">{agent.character}</p>
            </div>
            <div className="flex space-x-2 ml-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditAgent(agent);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              {agents.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAgent(agent.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}