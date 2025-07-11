// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Your Supabase Project URL
const supabaseUrl = 'https://drueqeumgoxlcnrkxfgz.supabase.co';

// Access your Supabase anon (public) key from Vite's environment variables.
// Ensure you have VITE_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY_HERE in your .env file.
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Ensure the key is available (optional, but good for debugging)
if (!supabaseKey) {
  console.error('Supabase API key (VITE_SUPABASE_KEY) is not defined. Please check your .env file.');
  // In a production app, you might want to throw an error or show a user-friendly message.
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey as string);
