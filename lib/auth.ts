/**
 * lib/auth.ts — Server-side identity and role checks for the API route handlers.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Answers two questions for every protected request: who is calling, and are they an admin.
 * Input is the current request's session cookies, read through the request-scoped Supabase
 * client; processing calls Supabase Auth to resolve the user and then reads that user's row in
 * public.profiles to obtain their role; output is either the user together with their role, or
 * a ready-made 401 or 403 JSON response. Running these checks on the server is what makes the
 * access levels real, because a check performed only in the browser can be bypassed from the
 * developer console by calling the API directly.
 */
import { createSupabaseServerClient } from './supabase-server';

export type Role = 'user' | 'admin';

export interface CurrentUser {
  id: string;
  email: string | undefined;
  role: Role;
}

/** Resolve the signed-in user and their role, or null when nobody is signed in. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  return {
    id: userData.user.id,
    email: userData.user.email,
    // Anything other than an explicit 'admin' is treated as a regular user.
    role: profile?.role === 'admin' ? 'admin' : 'user',
  };
}

/**
 * Guard for write endpoints.
 *
 * Returns the user on success, or a Response the caller should return immediately:
 *   const gate = await requireAdmin();
 *   if (gate instanceof Response) return gate;
 */
export async function requireAdmin(): Promise<CurrentUser | Response> {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { error: 'You must be signed in to perform this action.' },
      { status: 401 },
    );
  }

  if (user.role !== 'admin') {
    return Response.json(
      { error: 'Only administrators can add, edit or delete animals.' },
      { status: 403 },
    );
  }

  return user;
}
