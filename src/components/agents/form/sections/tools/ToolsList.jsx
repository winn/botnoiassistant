import React from 'react';
import { motion } from 'framer-motion';
import ToolItem from './ToolItem';

export default function ToolsList({ tools, selectedTools, onToggle }) {
  return (
    <div className="space-y-2">
      {tools.map(tool => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ToolItem
            tool={tool}
            isSelected={selectedTools.includes(tool.id)}
            onToggle={() => onToggle(tool.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}