/**
 * proxy.ts — Supabase session refresh for every incoming request.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Runs before each matched request so that expiring Supabase auth tokens are refreshed and
 * written back to the browser. Input is the incoming NextRequest together with its cookies;
 * processing calls supabase.auth.getUser(), which transparently refreshes the session and
 * hands any updated cookies to setAll; output is a NextResponse carrying those refreshed
 * cookies onward. Without this file users are silently signed out once their access token
 * expires, which is the most common cause of unreliable Supabase authentication in Next.js.
 *
 * Note: this file is named proxy.ts, not middleware.ts. Next.js 16 deprecated the middleware
 * convention and renamed both the file and its exported function to proxy.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }

          // No-cache headers supplied by the library. They stop a CDN or reverse proxy
          // caching a response that carries one user's session token.
          for (const [key, value] of Object.entries(headers ?? {})) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // This call is what performs the refresh. Do not remove it.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Without a matcher this would run on every static asset. Exclude Next.js internals
  // and image files so CSS, JS and images are never delayed by an auth round trip.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
