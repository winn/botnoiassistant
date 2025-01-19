import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import ModalWrapper from '../../shared/modals/ModalWrapper';
import ModalHeader from '../../shared/modals/ModalHeader';
import AgentForm from '../form/AgentForm';

export default function AgentFormModal({
  isOpen,
  onClose,
  onSave,
  agent = null,
  tools = [],
  isSubmitting = false
}) {
  const defaultFormData = {
    name: '',
    character: 'เป็นเพื่อนผู้หญิงน่ารัก คอยช่วยเหลือ ใจดี',
    actions: 'ให้ตอบสั้น ๆ เหมือนคุยกับเพื่อน ให้พูดไพเราะ ลงท้ายด้วยค่ะ แทนตัวเองว่า เอวา',
    enabled_tools: [],
    faqs: []
  };

  const [formData, setFormData] = React.useState(agent || defaultFormData);

  React.useEffect(() => {
    setFormData(agent || defaultFormData);
  }, [agent]);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative">
        <ModalHeader
          title={agent ? 'Edit Agent' : 'Add New Agent'}
          onClose={onClose}
        />
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <AgentForm
            formData={formData}
            setFormData={setFormData}
            tools={tools}
            onSubmit={onSave}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </motion.div>
    </ModalWrapper>
  );
}