export const mockAgents = [
  {
    id: '1',
    name: 'Test Agent',
    character: 'Friendly test assistant',
    actions: 'Help with testing',
    enabled_tools: [],
    faqs: [],
    is_public: false,
  },
];

export const mockTools = [
  {
    id: '1',
    name: 'Test Tool',
    description: 'A tool for testing',
    input: {
      description: 'Test input',
      schema: '{}',
    },
    output: {
      description: 'Test output',
      schema: '{}',
    },
  },
];

export const mockMessages = [
  {
    id: '1',
    agentId: '1',
    content: 'Hello',
    role: 'user',
    timestamp: Date.now(),
  },
  {
    id: '2',
    agentId: '1',
    content: 'Hi there!',
    role: 'assistant',
    timestamp: Date.now(),
  },
];