import React from 'react';
import { motion } from 'framer-motion';

export default function ModalContent({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-lg shadow-xl relative ${className}`}
    >
      {children}
    </motion.div>
  );
}