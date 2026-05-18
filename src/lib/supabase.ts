import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bzmsvnonamwmuhpqinlq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // React 19 StrictMode safety — bypass navigator.locks contention
    lock: async (_n, _t, fn) => fn(),
  },
});
