/**
 * lib/animals.ts — Animal types and database-row mapping.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Defines the Animal shape used throughout the user interface and converts raw database rows
 * into it. Input is a row from the public.animals table, whose columns are snake_case as is
 * conventional in Postgres; processing renames those columns to the camelCase property names
 * the existing React components already expect; output is a typed Animal object. Keeping this
 * mapping in one place is why AnimalCard, AnimalProfileModal and the gallery needed no changes
 * when the data moved from a static array to Supabase.
 */
import { HABITATS, type Habitat } from './validation';

export { HABITATS };
export type { Habitat };

// --- Animal as consumed by React components ---
export interface Animal {
  id: string;
  name: string;
  species: string;
  habitat: Habitat;
  diet: string;
  conservationStatus: string;
  image: string;
  description: string;
}

// --- Animal exactly as stored in Postgres ---
export interface AnimalRow {
  id: string;
  name: string;
  species: string;
  habitat: string;
  diet: string;
  conservation_status: string;
  image_url: string;
  description: string;
}

/** Columns selected from public.animals by the API route handlers. */
export const ANIMAL_COLUMNS =
  'id,name,species,habitat,diet,conservation_status,image_url,description' as const;

/** Convert one database row into the shape the UI expects. */
export function mapRowToAnimal(row: AnimalRow): Animal {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    habitat: row.habitat as Habitat,
    diet: row.diet,
    conservationStatus: row.conservation_status,
    image: row.image_url,
    description: row.description,
  };
}
