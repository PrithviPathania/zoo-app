/**
 * lib/validation.ts — Input validation for animal create and update requests.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Checks untrusted JSON sent by the browser before any of it reaches the database.
 * Input is an unknown value parsed from a request body; processing verifies that every
 * required field is a non-empty string of reasonable length, trims surrounding whitespace,
 * confirms the habitat is one of the four Calgary Zoo habitats, and confirms the image is a
 * http or https URL; output is either the cleaned data or a list of readable error messages.
 * Validating on the server matters because client-side checks can be bypassed entirely by
 * calling the API directly, so this module is the real gate rather than the form component.
 */

/** The four Calgary Zoo habitats. Mirrored by a CHECK constraint in supabase/schema.sql. */
export const HABITATS = [
  'Canadian Wilds',
  'Penguin Plunge',
  'Destination Africa',
  'Eurasia',
] as const;

export type Habitat = (typeof HABITATS)[number];

/** A validated animal, using the camelCase names the React components expect. */
export interface AnimalInput {
  name: string;
  species: string;
  habitat: Habitat;
  diet: string;
  conservationStatus: string;
  image: string;
  description: string;
}

export type ValidationResult =
  | { ok: true; value: AnimalInput }
  | { ok: false; errors: string[] };

const MAX_FIELD_LENGTH = 500;

const REQUIRED_TEXT_FIELDS = [
  ['name', 'Name'],
  ['species', 'Species'],
  ['diet', 'Diet'],
  ['conservationStatus', 'Conservation status'],
  ['description', 'Description'],
] as const;

/**
 * Validate and clean an untrusted request body.
 * Collects every problem rather than stopping at the first, so the user can fix them at once.
 */
export function validateAnimalInput(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, errors: ['Request body must be a JSON object.'] };
  }

  const raw = body as Record<string, unknown>;
  const errors: string[] = [];
  const cleaned: Record<string, string> = {};

  // --- Required free-text fields ---
  for (const [field, label] of REQUIRED_TEXT_FIELDS) {
    const value = raw[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${label} is required.`);
    } else if (value.trim().length > MAX_FIELD_LENGTH) {
      errors.push(`${label} must be ${MAX_FIELD_LENGTH} characters or fewer.`);
    } else {
      cleaned[field] = value.trim();
    }
  }

  // --- Habitat must be one of the four known exhibits ---
  const habitat = raw.habitat;
  if (typeof habitat !== 'string' || !HABITATS.includes(habitat as Habitat)) {
    errors.push(`Habitat must be one of: ${HABITATS.join(', ')}.`);
  }

  // --- Image must be an absolute http(s) URL ---
  const image = raw.image;
  if (typeof image !== 'string' || image.trim().length === 0) {
    errors.push('Image URL is required.');
  } else if (!/^https?:\/\/\S+$/i.test(image.trim())) {
    errors.push('Image URL must start with http:// or https://.');
  } else {
    cleaned.image = image.trim();
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: cleaned.name,
      species: cleaned.species,
      habitat: habitat as Habitat,
      diet: cleaned.diet,
      conservationStatus: cleaned.conservationStatus,
      image: cleaned.image,
      description: cleaned.description,
    },
  };
}

/** Convert validated input into the snake_case column names Postgres uses. */
export function toAnimalRow(input: AnimalInput) {
  return {
    name: input.name,
    species: input.species,
    habitat: input.habitat,
    diet: input.diet,
    conservation_status: input.conservationStatus,
    image_url: input.image,
    description: input.description,
  };
}
