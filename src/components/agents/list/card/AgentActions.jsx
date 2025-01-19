import React from 'react';
import { PencilIcon, TrashIcon, ShareIcon } from '@heroicons/react/24/solid';
import IconButton from '../../../shared/buttons/icons/IconButton';

export default function AgentActions({ agent, onEdit, onDelete, onShare }) {
  return (
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
  );
}