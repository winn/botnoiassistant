import React from 'react';
import { motion } from 'framer-motion';

export default function Pulse({ 
  children,
  duration = 1,
  repeat = Infinity 
}) {
  return (
    <motion.div
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration, repeat }}
    >
      {children}
    </motion.div>
  );
}