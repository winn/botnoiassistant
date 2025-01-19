import React from 'react';
import ToolsList from './ToolsList';
import EmptyToolsState from './EmptyToolsState';
import SectionHeader from '../common/SectionHeader';

export default function ToolsSection({ tools = [], selectedTools = [], onChange }) {
  const toggleTool = (toolId) => {
    onChange(
      selectedTools.includes(toolId)
        ? selectedTools.filter(id => id !== toolId)
        : [...selectedTools, toolId]
    );
  };

  return (
    <div>
      <SectionHeader
        title="Available Tools"
        description="Select the tools this agent can use when responding to users"
      />
      <div className="max-h-[400px] overflow-y-auto p-2 border rounded-lg">
        {tools.length > 0 ? (
          <ToolsList
            tools={tools}
            selectedTools={selectedTools}
            onToggle={toggleTool}
          />
        ) : (
          <EmptyToolsState />
        )}
      </div>
    </div>
  );
}