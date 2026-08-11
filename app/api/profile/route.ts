/**
 * app/api/profile/route.ts — REST endpoint for the signed-in user's own profile.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Reads and updates the profile row belonging to whoever is currently signed in.
 * Input for GET is nothing beyond the session cookie, while input for PUT is a JSON body
 * holding a favouriteAnimalId; processing resolves the caller through Supabase Auth and then
 * reads or writes only their own row, a restriction Row Level Security enforces independently
 * of this code; output is JSON describing the user's role and their favourite animal. The
 * column-level grants in supabase/schema.sql prevent a user promoting themselves through this
 * endpoint, because the authenticated role may only update the favourite_animal_id column.
 */
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

// --- GET /api/profile — the caller's role and saved favourite ---
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('favourite_animal_id')
    .eq('id', user.id)
    .maybeSingle();

  return Response.json({
    role: user.role,
    favouriteAnimalId: data?.favourite_animal_id ?? null,
  });
}

// --- PUT /api/profile — save the caller's favourite animal ---
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const { favouriteAnimalId } = body as { favouriteAnimalId?: unknown };
  if (typeof favouriteAnimalId !== 'string' || favouriteAnimalId.trim().length === 0) {
    return Response.json({ error: 'Please choose an animal.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ favourite_animal_id: favouriteAnimalId })
    .eq('id', user.id);

  if (error) {
    return Response.json({ error: 'Could not save your favourite animal.' }, { status: 500 });
  }

  return Response.json({ favouriteAnimalId });
}
