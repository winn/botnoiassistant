import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bkajnqaikyduvqkpbhzo.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWpucWFpa3lkdXZxa3BiaHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNDEwNzEsImV4cCI6MjA1MjYxNzA3MX0.oWTm9dsu3p3QoZUNLfbHurqXVGtIQSidvFTCzDNqyvc';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);