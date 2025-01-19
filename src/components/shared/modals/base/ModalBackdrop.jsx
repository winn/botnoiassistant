import React from 'react';
import { motion } from 'framer-motion';

export default function ModalBackdrop({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-25"
      onClick={onClose}
    />
  );
}