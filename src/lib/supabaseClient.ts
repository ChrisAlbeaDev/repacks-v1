import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drueqeumgoxlcnrkxfgz.supabase.co';

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseKey) {
  console.error('Supabase API key (VITE_SUPABASE_KEY) is not defined. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey as string);
