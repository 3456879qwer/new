import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


console.log('DEBUG_SUPABASE_CLIENT: Supabase URL value:', supabaseUrl ? 'Loaded' : 'NOT LOADED');
console.log('DEBUG_SUPABASE_CLIENT: Supabase Anon Key value:', supabaseAnonKey ? 'Loaded' : 'NOT LOADED');
console.log('DEBUG_SUPABASE_CLIENT: Process environment check (URL exists?):', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('DEBUG_SUPABASE_CLIENT: Process environment check (Anon Key exists?):', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);