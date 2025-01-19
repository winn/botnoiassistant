import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface Agent {
  id: string;
  name: string;
  character: string;
  actions: string;
  enabled_tools: string[];
  faqs: Array<{ id: string; question: string; answer: string }>;
  is_public: boolean;
}

interface AgentsState {
  agents: Agent[];
  selectedAgentId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  selectedAgentId: null,
  isLoading: false,
  error: null,
};

export const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload;
    },
    addAgent: (state, action: PayloadAction<Agent>) => {
      state.agents.push(action.payload);
    },
    updateAgent: (state, action: PayloadAction<Agent>) => {
      const index = state.agents.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      }
    },
    deleteAgent: (state, action: PayloadAction<string>) => {
      state.agents = state.agents.filter(a => a.id !== action.payload);
      if (state.selectedAgentId === action.payload) {
        state.selectedAgentId = state.agents[0]?.id || null;
      }
    },
    setSelectedAgentId: (state, action: PayloadAction<string | null>) => {
      state.selectedAgentId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAgents,
  addAgent,
  updateAgent,
  deleteAgent,
  setSelectedAgentId,
  setLoading,
  setError,
} = agentsSlice.actions;

export const selectAgents = (state: RootState) => state.agents.agents;
export const selectSelectedAgentId = (state: RootState) => state.agents.selectedAgentId;
export const selectSelectedAgent = (state: RootState) =>
  state.agents.agents.find(a => a.id === state.agents.selectedAgentId);
export const selectIsLoading = (state: RootState) => state.agents.isLoading;
export const selectError = (state: RootState) => state.agents.error;

export default agentsSlice.reducer;