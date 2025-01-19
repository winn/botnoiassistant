import React from 'react';
import { AnimatePresence } from 'framer-motion';
import FAQItem from './FAQItem';

export default function FAQList({ faqs, onUpdate, onRemove }) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {faqs.map((faq, index) => (
          <FAQItem
            key={faq.id}
            faq={faq}
            index={index}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}