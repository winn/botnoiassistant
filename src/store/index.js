import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import chatReducer from './slices/chatSlice';
import agentsReducer from './slices/agentsSlice';
import toolsReducer from './slices/toolsSlice';
import settingsReducer from './slices/settingsSlice';
import { api } from './api';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    agents: agentsReducer,
    tools: toolsReducer,
    settings: settingsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;