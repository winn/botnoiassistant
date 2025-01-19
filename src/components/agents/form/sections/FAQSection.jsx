import React from 'react';
import FAQHeader from './faq/FAQHeader';
import FAQList from './faq/FAQList';
import EmptyFAQState from './faq/EmptyFAQState';

export default function FAQSection({ faqs = [], onChange }) {
  const addFaq = () => {
    onChange([
      ...faqs,
      { id: crypto.randomUUID(), question: '', answer: '' }
    ]);
  };

  const updateFaq = (id, field, value) => {
    onChange(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
  };

  const removeFaq = (id) => {
    onChange(faqs.filter(faq => faq.id !== id));
  };

  return (
    <div>
      <FAQHeader onAdd={addFaq} />
      {faqs.length > 0 ? (
        <FAQList
          faqs={faqs}
          onUpdate={updateFaq}
          onRemove={removeFaq}
        />
      ) : (
        <EmptyFAQState onAdd={addFaq} />
      )}
    </div>
  );
}