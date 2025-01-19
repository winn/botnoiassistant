import React from 'react';
import SharedBadge from './SharedBadge';

export default function AgentInfo({ name, character, isShared }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2">
        <h4 className="font-medium text-gray-800">{name}</h4>
        {isShared && <SharedBadge />}
      </div>
      <p className="text-sm text-gray-500 truncate break-words">
        {character}
      </p>
    </div>
  );
}