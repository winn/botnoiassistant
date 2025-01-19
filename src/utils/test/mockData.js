export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser'
};

export const mockAgent = {
  id: 'test-agent-id',
  name: 'Test Agent',
  character: 'Friendly test assistant',
  actions: 'Help with testing',
  enabled_tools: [],
  faqs: []
};

export const mockTool = {
  id: 'test-tool-id',
  name: 'Test Tool',
  description: 'A tool for testing',
  input: {
    description: 'Test input',
    schema: '{}'
  },
  output: {
    description: 'Test output',
    schema: '{}'
  }
};

export const mockConversation = {
  id: 'test-conversation-id',
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Hello'
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'Hi there!'
    }
  ]
};