import React from 'react';
import { PencilIcon } from '@heroicons/react/24/solid';
import ToolsList from './ToolsList';
import AgentsList from './AgentsList';

export default function Settings({
  agents,
  selectedAgentId,
  onAddAgent,
  onEditAgent,
  onDeleteAgent,
  onSelectAgent,
  tools,
  onAddTool,
  onEditTool
}) {
  return (
    <div className="space-y-6">
      {/* Agents Section */}
      <div className="border rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3">
          <AgentsList
            agents={agents}
            selectedAgentId={selectedAgentId}
            onAddAgent={onAddAgent}
            onEditAgent={onEditAgent}
            onDeleteAgent={onDeleteAgent}
            onSelectAgent={onSelectAgent}
          />
        </div>
      </div>

      {/* Tools Section */}
      <div className="border rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3">
          <ToolsList
            tools={tools}
            onAddTool={onAddTool}
            onEditTool={onEditTool}
          />
        </div>
      </div>
    </div>
  );
}