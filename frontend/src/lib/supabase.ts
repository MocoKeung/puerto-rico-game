import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/** Helper: call a Supabase Edge Function with the current user's JWT */
export async function callEdgeFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  // Force a fresh token by calling getUser() which validates with the server
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });

  if (error) {
    // Supabase FunctionsHttpError.context is a Response — read body for real detail
    let detail = '';
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      try {
        const text = await context.clone().text();
        try {
          const parsed = JSON.parse(text);
          detail = parsed.error ?? parsed.message ?? text;
        } catch {
          detail = text;
        }
      } catch {
        /* ignore */
      }
    }
    const base = error instanceof Error ? error.message : `Edge function ${functionName} failed`;
    throw new Error(detail ? `${base}: ${detail}` : base);
  }

  return data as T;
}
