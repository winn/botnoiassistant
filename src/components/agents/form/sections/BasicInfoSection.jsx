import React from 'react';
import TextInput from '../../../shared/forms/inputs/TextInput';
import TextArea from '../../../shared/forms/inputs/TextArea';

export default function BasicInfoSection({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <TextInput
          label="Agent Name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Enter agent name"
          helper="Give your agent a unique and descriptive name"
          required
        />
      </div>

      <div>
        <TextArea
          label="Character Description"
          value={formData.character}
          onChange={(e) => onChange('character', e.target.value)}
          placeholder="Example: A friendly and helpful female assistant who is kind and supportive"
          helper="Define the personality traits and characteristics of your AI assistant"
          rows={4}
          required
        />
      </div>

      <div>
        <TextArea
          label="Behavior Instructions"
          value={formData.actions}
          onChange={(e) => onChange('actions', e.target.value)}
          placeholder="Example: Respond concisely, use polite language, end messages with ค่ะ, refer to self as เอวา"
          helper="Specify how the assistant should behave and respond to user inputs"
          rows={4}
          required
        />
      </div>
    </div>
  );
}