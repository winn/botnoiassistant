import React from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import AgentCard from './card/AgentCard';
import IconButton from '../../shared/buttons/icons/IconButton';

export default function AgentsList({
  agents = [],
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
        <IconButton
          icon={PlusIcon}
          onClick={onAddAgent}
          className="text-sky-500 hover:bg-sky-50"
          label="Add new agent"
        />
      </div>
      
      <div className="space-y-2">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgentId === agent.id}
            onSelect={onSelectAgent}
            onEdit={onEditAgent}
            onDelete={onDeleteAgent}
            onShare={onShareAgent}
          />
        ))}
      </div>
    </div>
  );
}