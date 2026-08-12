/**
 * app/api/animals/[id]/route.ts — REST endpoint for a single animal.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Handles reading, updating and deleting one animal identified by its uuid in the URL.
 * Input is the id path parameter plus, for the write methods, a JSON body describing the
 * animal; processing resolves the caller's identity from their session cookies, enforces that
 * only administrators may modify data, validates the submitted body, and then runs the matching
 * Supabase query; output is JSON containing the affected animal or a descriptive error with an
 * appropriate status code. Note that params is awaited because Next.js 16 removed synchronous
 * access to route parameters, and RouteContext is a generated global type needing no import.
 */
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { ANIMAL_COLUMNS, mapRowToAnimal, type AnimalRow } from '@/lib/animals';
import { requireAdmin } from '@/lib/auth';
import { validateAnimalInput, toAnimalRow } from '@/lib/validation';

// --- GET /api/animals/[id] — fetch one animal ---
export async function GET(_request: Request, ctx: RouteContext<'/api/animals/[id]'>) {
  const { id } = await ctx.params;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('animals')
    .select(ANIMAL_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: 'Could not load that animal.' }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: 'Animal not found.' }, { status: 404 });
  }

  return Response.json({ animal: mapRowToAnimal(data as AnimalRow) });
}

// --- PUT /api/animals/[id] — replace an animal. Administrators only ---
export async function PUT(request: Request, ctx: RouteContext<'/api/animals/[id]'>) {
  const gate = await requireAdmin();
  if (gate instanceof Response) return gate;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const result = validateAnimalInput(body);
  if (!result.ok) {
    return Response.json({ error: 'Validation failed.', details: result.errors }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('animals')
    .update(toAnimalRow(result.value))
    .eq('id', id)
    .select(ANIMAL_COLUMNS)
    .maybeSingle();

  if (error) {
    return Response.json({ error: 'Could not update the animal.' }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: 'Animal not found.' }, { status: 404 });
  }

  return Response.json({ animal: mapRowToAnimal(data as AnimalRow) });
}

// --- DELETE /api/animals/[id] — remove an animal. Administrators only ---
export async function DELETE(_request: Request, ctx: RouteContext<'/api/animals/[id]'>) {
  const gate = await requireAdmin();
  if (gate instanceof Response) return gate;

  const { id } = await ctx.params;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    return Response.json({ error: 'Could not delete the animal.' }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: 'Animal not found.' }, { status: 404 });
  }

  return Response.json({ success: true, id });
}
