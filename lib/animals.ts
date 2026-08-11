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

// --- Legacy static data source ---
// Superseded by the public.animals table; these six records were used to seed it.
// Retained only until the gallery and profile pages read from the API, then deleted.
export const zooAnimals: Animal[] = [
  {
    id: "1",
    name: "Skoki",
    species: "Grizzly Bear",
    habitat: "Canadian Wilds",
    diet: "Omnivore",
    conservationStatus: "Special Concern",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800",
    description: "Skoki lives in the Canadian Wilds habitat at Calgary Zoo, representing native Canadian wildlife."
  },
  {
    id: "2",
    name: "Sven",
    species: "King Penguin",
    habitat: "Penguin Plunge",
    diet: "Carnivore (Fish)",
    conservationStatus: "Least Concern",
    image: "https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800",
    description: "Sven is a King Penguin at the Penguin Plunge exhibit, thriving in climate-controlled polar pools."
  },
  {
    id: "3",
    name: "Amba",
    species: "Amur Tiger",
    habitat: "Eurasia",
    diet: "Carnivore",
    conservationStatus: "Endangered",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800",
    description: "Amba is an Amur Tiger in the Eurasia section, part of global endangered species conservation initiatives."
  },
  {
    id: "4",
    name: "Lodo",
    species: "Hippopotamus",
    habitat: "Destination Africa",
    diet: "Herbivore",
    conservationStatus: "Vulnerable",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800",
    description: "Lodo enjoys the spacious aquatic pools in the Destination Africa habitat."
  },
  {
    id: "5",
    name: "Darian",
    species: "African Lion",
    habitat: "Destination Africa",
    diet: "Carnivore",
    conservationStatus: "Vulnerable",
    image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=800",
    description: "Darian is the pride leader at the Calgary Zoo African savanna exhibit."
  },
  {
    id: "6",
    name: "Kazi",
    species: "Red Panda",
    habitat: "Eurasia",
    diet: "Herbivore (Bamboo)",
    conservationStatus: "Endangered",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800",
    description: "Kazi loves climbing trees in the forested Eurasia outdoor habitat."
  }
];
