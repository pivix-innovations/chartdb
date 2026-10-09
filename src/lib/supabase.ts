import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabase = supabaseConfigured
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : undefined;
