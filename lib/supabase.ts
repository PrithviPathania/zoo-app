/**
 * lib/supabase.ts — Browser-side Supabase client for the Calgary Zoo Explorer.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Creates the single Supabase client used by React client components in the browser.
 * Input is the project URL and publishable key supplied through environment variables;
 * processing is delegated to createBrowserClient from @supabase/ssr, which stores the
 * signed-in user's session in cookies rather than in localStorage; output is a configured
 * SupabaseClient instance shared across the app. Cookie storage is essential because it is
 * the only way the Next.js server can read the session and enforce administrator access.
 */
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
