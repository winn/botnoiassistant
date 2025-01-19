import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  audioUrl?: string;
}

interface ChatState {
  messages: Record<string, Message[]>;
  isProcessing: boolean;
  isSpeaking: boolean;
  streamingText: string;
  error: string | null;
}

const initialState: ChatState = {
  messages: {},
  isProcessing: false,
  isSpeaking: false,
  streamingText: '',
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ agentId: string; message: Message }>) => {
      const { agentId, message } = action.payload;
      if (!state.messages[agentId]) {
        state.messages[agentId] = [];
      }
      state.messages[agentId].push(message);
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setSpeaking: (state, action: PayloadAction<boolean>) => {
      state.isSpeaking = action.payload;
    },
    setStreamingText: (state, action: PayloadAction<string>) => {
      state.streamingText = action.payload;
    },
    clearHistory: (state, action: PayloadAction<string>) => {
      state.messages[action.payload] = [];
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addMessage,
  setProcessing,
  setSpeaking,
  setStreamingText,
  clearHistory,
  setError,
} = chatSlice.actions;

export const selectMessages = (state: RootState, agentId: string) =>
  state.chat.messages[agentId] || [];
export const selectIsProcessing = (state: RootState) => state.chat.isProcessing;
export const selectIsSpeaking = (state: RootState) => state.chat.isSpeaking;
export const selectStreamingText = (state: RootState) => state.chat.streamingText;
export const selectError = (state: RootState) => state.chat.error;

export default chatSlice.reducer;