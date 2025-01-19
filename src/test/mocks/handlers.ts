import { rest } from 'msw';
import { mockAgents, mockTools, mockMessages } from './data';

export const handlers = [
  rest.get('/api/agents', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockAgents));
  }),

  rest.get('/api/tools', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTools));
  }),

  rest.get('/api/messages/:agentId', (req, res, ctx) => {
    const { agentId } = req.params;
    return res(
      ctx.status(200),
      ctx.json(mockMessages.filter(m => m.agentId === agentId))
    );
  }),

  rest.post('/api/messages', async (req, res, ctx) => {
    const message = await req.json();
    return res(ctx.status(201), ctx.json(message));
  }),
];