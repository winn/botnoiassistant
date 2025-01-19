import React from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ShareIcon } from '@heroicons/react/24/solid';

export default function AgentsList({
  agents,
  selectedAgentId,
  onAddAgent,
  onEditAgent,
  onDeleteAgent,
  onSelectAgent,
  onShareAgent
}) {
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
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-800">{agent.name}</h4>
                {agent.is_shared && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-800">
                    Shared
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate break-words">{agent.character}</p>
            </div>
            <div className="flex space-x-2 ml-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShareAgent?.(agent);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  agent.is_shared 
                    ? 'bg-sky-100 text-sky-500 hover:bg-sky-200'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
                title={agent.is_shared ? 'Manage sharing' : 'Share agent'}
              >
                <ShareIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditAgent?.(agent);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                title="Edit agent"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              {agents.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAgent?.(agent.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                  title="Delete agent"
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