import React from 'react';
import BasicInfoSection from './sections/BasicInfoSection';
import FAQSection from './sections/FAQSection';
import ToolsSection from './sections/ToolsSection';
import PrimaryButton from '../../shared/buttons/variants/PrimaryButton';
import SecondaryButton from '../../shared/buttons/variants/SecondaryButton';

export default function AgentForm({
  formData,
  setFormData,
  tools = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  buttonText = 'Save'
}) {
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      alert('Please enter an agent name');
      return;
    }

    if (!formData.character?.trim()) {
      alert('Please enter a character description');
      return;
    }

    if (!formData.actions?.trim()) {
      alert('Please enter behavior instructions');
      return;
    }

    onSubmit(formData);
  };

  const handleBasicInfoChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFaqsChange = (faqs) => {
    setFormData(prev => ({ ...prev, faqs }));
  };

  const handleToolsChange = (enabled_tools) => {
    setFormData(prev => ({ ...prev, enabled_tools }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form Sections */}
      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Basic Information
          </h3>
          <BasicInfoSection
            formData={formData}
            onChange={handleBasicInfoChange}
          />
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Knowledge Base
          </h3>
          <FAQSection
            faqs={formData.faqs}
            onChange={handleFaqsChange}
          />
        </section>

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Capabilities
          </h3>
          <ToolsSection
            tools={tools}
            selectedTools={formData.enabled_tools}
            onChange={handleToolsChange}
          />
        </section>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <SecondaryButton
          type="button"
          onClick={onCancel}
          className="min-w-[120px] h-12 px-8 text-base font-medium"
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          loading={isSubmitting}
          className="min-w-[120px] h-12 px-8 text-base font-medium"
        >
          {buttonText}
        </PrimaryButton>
      </div>
    </form>
  );
}