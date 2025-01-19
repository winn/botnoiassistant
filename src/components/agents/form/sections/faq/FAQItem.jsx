import React from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import TextInput from '../../../../shared/forms/inputs/TextInput';
import TextArea from '../../../../shared/forms/inputs/TextArea';
import IconButton from '../../../../shared/buttons/icons/IconButton';

export default function FAQItem({ faq, index, onUpdate, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 border rounded-lg bg-gray-50"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-gray-500">
          FAQ #{index + 1}
        </span>
        <IconButton
          icon={TrashIcon}
          onClick={() => onRemove(faq.id)}
          className="text-red-500 hover:bg-red-50"
          label="Remove FAQ"
          size="sm"
        />
      </div>

      <div className="space-y-3">
        <TextInput
          value={faq.question}
          onChange={(e) => onUpdate(faq.id, 'question', e.target.value)}
          placeholder="What is your name?"
          helper="Enter a common question users might ask"
        />
        <TextArea
          value={faq.answer}
          onChange={(e) => onUpdate(faq.id, 'answer', e.target.value)}
          placeholder="My name is Eva, I'm here to help you!"
          helper="Provide a clear and helpful answer"
          rows={2}
        />
      </div>
    </motion.div>
  );
}