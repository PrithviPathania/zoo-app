/**
 * app/components/AnimalForm.tsx — Controlled form for creating and editing animals.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Presents the seven editable fields of an animal and collects them into a single object.
 * Input is an optional existing animal used to pre-fill the fields, together with submit and
 * cancel callbacks supplied by the admin page; processing holds each field in React state,
 * applies the same required-field, habitat and image-URL rules the server enforces, and
 * disables the button while a request is in flight; output is a trimmed set of animal values
 * handed to the onSubmit callback. The matching checks in lib/validation.ts remain
 * authoritative, because anything sent directly to the API never runs this component.
 */
'use client';

import { useState } from 'react';
import { HABITATS, type Animal, type Habitat } from '@/lib/animals';

type FormValues = Omit<Animal, 'id'>;

interface AnimalFormProps {
  initial?: Animal;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_FORM: FormValues = {
  name: '',
  species: '',
  habitat: 'Canadian Wilds',
  diet: '',
  conservationStatus: '',
  image: '',
  description: '',
};

const REQUIRED_FIELDS: [keyof FormValues, string][] = [
  ['name', 'Name'],
  ['species', 'Species'],
  ['diet', 'Diet'],
  ['conservationStatus', 'Conservation status'],
  ['image', 'Image URL'],
  ['description', 'Description'],
];

export default function AnimalForm({ initial, submitLabel, onSubmit, onCancel }: AnimalFormProps) {
  const [values, setValues] = useState<FormValues>(
    initial
      ? {
          name: initial.name,
          species: initial.species,
          habitat: initial.habitat,
          diet: initial.diet,
          conservationStatus: initial.conservationStatus,
          image: initial.image,
          description: initial.description,
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  function update(field: keyof FormValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  // Mirrors lib/validation.ts so problems surface without a server round trip.
  function findErrors(candidate: FormValues): string[] {
    const found: string[] = [];

    for (const [field, label] of REQUIRED_FIELDS) {
      if (candidate[field].trim().length === 0) found.push(`${label} is required.`);
    }
    if (!HABITATS.includes(candidate.habitat)) {
      found.push('Please choose a habitat.');
    }
    if (
      candidate.image.trim().length > 0 &&
      !/^https?:\/\/\S+$/i.test(candidate.image.trim())
    ) {
      found.push('Image URL must start with http:// or https://.');
    }

    return found;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed: FormValues = {
      ...values,
      name: values.name.trim(),
      species: values.species.trim(),
      diet: values.diet.trim(),
      conservationStatus: values.conservationStatus.trim(),
      image: values.image.trim(),
      description: values.description.trim(),
    };

    const found = findErrors(trimmed);
    setErrors(found);
    if (found.length > 0) return;

    setIsSaving(true);
    try {
      await onSubmit(trimmed);
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    'w-full mt-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none';
  const labelClass = 'text-sm font-semibold text-gray-700';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
    >
      {/* Validation summary */}
      {errors.length > 0 && (
        <ul className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm list-disc list-inside">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClass}>Name</span>
          <input
            className={inputClass}
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Species</span>
          <input
            className={inputClass}
            value={values.species}
            onChange={(e) => update('species', e.target.value)}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Habitat</span>
          <select
            className={inputClass}
            value={values.habitat}
            onChange={(e) => update('habitat', e.target.value as Habitat)}
          >
            {HABITATS.map((habitat) => (
              <option key={habitat} value={habitat}>
                {habitat}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Diet</span>
          <input
            className={inputClass}
            value={values.diet}
            onChange={(e) => update('diet', e.target.value)}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Conservation status</span>
          <input
            className={inputClass}
            value={values.conservationStatus}
            onChange={(e) => update('conservationStatus', e.target.value)}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Image URL</span>
          <input
            className={inputClass}
            value={values.image}
            onChange={(e) => update('image', e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Description</span>
        <textarea
          className={`${inputClass} min-h-24`}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition disabled:opacity-40"
        >
          {isSaving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
