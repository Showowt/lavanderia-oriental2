import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Allow build to succeed without env vars (for CI/CD)
const isBuildTime = process.env.NODE_ENV === 'production' && !supabaseUrl;

if (!isBuildTime && (!supabaseUrl || !supabaseKey)) {
  console.warn('Missing Supabase environment variables');
}

// Client-side Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

// Server-side client with service role
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || supabaseKey || 'placeholder-key'
);
