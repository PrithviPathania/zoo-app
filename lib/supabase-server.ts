/**
 * lib/supabase-server.ts — Request-scoped Supabase client for server-side code.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Builds a Supabase client that authenticates as whoever made the current HTTP request,
 * by reading the session cookies Next.js exposes through next/headers. Input is the incoming
 * request's cookie jar; processing wires that jar into createServerClient from @supabase/ssr
 * using the required getAll and setAll methods; output is a SupabaseClient scoped to that one
 * request. Because the client carries the caller's identity, every query it runs is subject to
 * the Row Level Security policies defined in supabase/schema.sql.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for the current request.
 * A new client must be built per request — never share one across requests.
 */
export async function createSupabaseServerClient() {
  // cookies() is asynchronous in Next.js 16; synchronous access was removed.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Thrown when called from a Server Component, where cookies are read-only.
            // Safe to ignore: proxy.ts refreshes the session on every request instead.
          }
        },
      },
    },
  );
}
