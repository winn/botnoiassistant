import React from 'react';
import { motion } from 'framer-motion';

export default function MessageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
    >
      {children}
    </motion.div>
  );
}