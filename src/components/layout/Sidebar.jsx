import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import AgentsList from '../agents/AgentsList';
import ToolsList from '../tools/ToolsList';
import { useModal } from '../../contexts/ModalContext';

export default function Sidebar({
  agents,
  selectedAgentId,
  onDeleteAgent,
  onSelectAgent,
  tools,
  onClose
}) {
  const { openAgentModal, openToolModal } = useModal();

  return (
    <div className="space-y-6">
      {onClose && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sky-100 text-sky-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Agents Section */}
      <div className="border rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3">
          <AgentsList
            agents={agents}
            selectedAgentId={selectedAgentId}
            onAddAgent={() => openAgentModal()}
            onEditAgent={(agent) => openAgentModal(agent)}
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
            onAddTool={() => openToolModal()}
            onEditTool={(tool) => openToolModal(tool)}
          />
        </div>
      </div>
    </div>
  );
}