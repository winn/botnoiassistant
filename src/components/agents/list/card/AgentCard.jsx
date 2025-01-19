import React from 'react';
import AgentInfo from './AgentInfo';
import AgentActions from './AgentActions';

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
      <AgentInfo
        name={agent.name}
        character={agent.character}
        isShared={agent.is_shared}
      />
      {showActions && (
        <AgentActions
          agent={agent}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
        />
      )}
    </div>
  );
}