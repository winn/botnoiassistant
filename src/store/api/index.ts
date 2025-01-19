import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabase';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers) => {
      const token = supabase.auth.getSession()?.access_token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Agents', 'Tools', 'Messages'],
  endpoints: (builder) => ({
    getAgents: builder.query({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('agents')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ['Agents'],
    }),

    getTools: builder.query({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('tools')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ['Tools'],
    }),

    getMessages: builder.query({
      queryFn: async ({ agentId }) => {
        try {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('agent_id', agentId)
            .order('created_at', { ascending: true });

          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, { agentId }) => [{ type: 'Messages', id: agentId }],
    }),
  }),
});

export const {
  useGetAgentsQuery,
  useGetToolsQuery,
  useGetMessagesQuery,
} = api;