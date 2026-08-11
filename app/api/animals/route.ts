/**
 * app/api/animals/route.ts — REST endpoint for the animal collection.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Serves the list of Calgary Zoo animals to the browser and accepts new ones from admins.
 * Input for GET is an optional habitat query parameter used to filter the results, and input
 * for POST is a JSON body describing a new animal; processing queries public.animals through a
 * request-scoped Supabase client, and for writes first confirms the caller is an administrator
 * and that the submitted data passes validation; output is JSON of the form { animals } for a
 * read or { animal } for a successful create. Reads are public because the gallery is open to
 * everyone, while writes are refused with 401 or 403 for anyone who is not an administrator.
 */
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { ANIMAL_COLUMNS, mapRowToAnimal, type AnimalRow } from '@/lib/animals';
import { requireAdmin } from '@/lib/auth';
import { validateAnimalInput, toAnimalRow } from '@/lib/validation';

// --- GET /api/animals — list every animal, optionally filtered by habitat ---
export async function GET(request: Request) {
  const habitat = new URL(request.url).searchParams.get('habitat');

  const supabase = await createSupabaseServerClient();

  let query = supabase.from('animals').select(ANIMAL_COLUMNS).order('name');
  if (habitat && habitat !== 'All') {
    query = query.eq('habitat', habitat);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: 'Could not load animals. Please try again.' }, { status: 500 });
  }

  return Response.json({ animals: (data as AnimalRow[]).map(mapRowToAnimal) });
}

// --- POST /api/animals — create an animal. Administrators only ---
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof Response) return gate;

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
    .insert(toAnimalRow(result.value))
    .select(ANIMAL_COLUMNS)
    .single();

  if (error) {
    return Response.json({ error: 'Could not create the animal.' }, { status: 500 });
  }

  return Response.json({ animal: mapRowToAnimal(data as AnimalRow) }, { status: 201 });
}
