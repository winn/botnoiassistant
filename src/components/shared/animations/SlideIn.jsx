import React from 'react';
import { motion } from 'framer-motion';

export default function SlideIn({ 
  children, 
  direction = 'up',
  duration = 0.2,
  delay = 0 
}) {
  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionVariants[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directionVariants[direction] }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}