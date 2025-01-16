import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to demo project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vuhxlbslsxpaiachosno.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aHhsYnNsc3hwYWlhY2hvc25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3ODk1OTgsImV4cCI6MjA1MjM2NTU5OH0.c-2-b8GGcXXAsYKt9Rz-zsG4t7WAlbyEe0xRwfaj11E';

// Create a single client instance with retry configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Don't persist auth state
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
    fetch: (...args) => {
      // Add retry logic for failed requests
      const fetch = (...args) => window.fetch(...args);
      return new Promise((resolve, reject) => {
        fetch(...args)
          .then(resolve)
          .catch(err => {
            console.warn('Supabase fetch error:', err);
            // Retry once after a short delay
            setTimeout(() => {
              fetch(...args)
                .then(resolve)
                .catch(reject);
            }, 1000);
          });
      });
    }
  }
});