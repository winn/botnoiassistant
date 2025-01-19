import React from 'react';
import { PencilIcon, TrashIcon, ShareIcon } from '@heroicons/react/24/solid';
import IconButton from '../../shared/buttons/icons/IconButton';

export default function AgentCard({
  agent,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  showActions = true
}) {
  return (
    <div
      className={`
        flex items-center justify-between p-3 bg-white rounded-lg shadow-sm 
        hover:shadow-md transition-shadow cursor-pointer
        ${isSelected ? 'ring-2 ring-sky-500' : ''}
      `}
      onClick={() => onSelect?.(agent.id)}
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
        <p className="text-sm text-gray-500 truncate break-words">
          {agent.character}
        </p>
      </div>

      {showActions && (
        <div className="flex space-x-2 ml-2 flex-shrink-0">
          <IconButton
            icon={ShareIcon}
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(agent);
            }}
            className={agent.is_shared ? 'bg-sky-100 text-sky-500' : 'text-gray-500'}
            label={agent.is_shared ? 'Manage sharing' : 'Share agent'}
            size="sm"
          />
          <IconButton
            icon={PencilIcon}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(agent);
            }}
            className="text-gray-500"
            label="Edit agent"
            size="sm"
          />
          <IconButton
            icon={TrashIcon}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(agent.id);
            }}
            className="text-red-500 hover:bg-red-50"
            label="Delete agent"
            size="sm"
          />
        </div>
      )}
    </div>
  );
}