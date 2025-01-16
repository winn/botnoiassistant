import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single client instance with retry configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true, // Enable token auto-refresh
    detectSessionInUrl: true // Enable session detection in URL
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