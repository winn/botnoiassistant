import React from 'react';
import { motion } from 'framer-motion';

export default function Scale({ 
  children, 
  duration = 0.2,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}