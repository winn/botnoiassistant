import React from 'react';
import { motion } from 'framer-motion';

export default function FadeIn({ 
  children, 
  duration = 0.2,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}