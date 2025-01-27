import React from 'react';
import TextInput from '../../../shared/forms/inputs/TextInput';
import TextArea from '../../../shared/forms/inputs/TextArea';
import Select from '../../../shared/forms/inputs/Select';

const LLM_OPTIONS = [
  { value: 'gpt-4', label: 'GPT-4 (OpenAI)' },
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'gemini', label: 'Gemini (Google)' }
];

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
        <Select
          label="LLM Engine"
          value={formData.llmEngine || 'gpt-4'}
          onChange={(e) => onChange('llmEngine', e.target.value)}
          options={LLM_OPTIONS}
          helper="Select the language model to power this agent"
          required
        />
      </div>

      <div>
        <TextArea
          label="Greeting Message"
          value={formData.greeting}
          onChange={(e) => onChange('greeting', e.target.value)}
          placeholder="Example: Hello! I'm Eva, your friendly AI assistant. How can I help you today?"
          helper="This message will be sent automatically when the agent is selected"
          rows={2}
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