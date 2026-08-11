/**
 * app/admin/page.tsx — Administrator dashboard for managing the animal collection.
 * Author: Ricky Mormor | Date: 2026-08-10
 *
 * Gives administrators a single screen on which to create, edit and delete zoo animals.
 * Input is the signed-in user's session together with the animal list fetched from the REST
 * API; processing reads the caller's role from /api/profile, hides the entire management table
 * from anybody who is not an administrator, and sends create, update and delete requests to
 * the /api/animals endpoints; output is the rendered dashboard plus any error the server
 * returned. The role check here only decides what is displayed, since the API performs the
 * authorisation that actually matters and will refuse an unauthorised write regardless.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';
import AnimalForm from '../components/AnimalForm';
import type { Animal } from '@/lib/animals';

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; animal: Animal };

export default function AdminPage() {
  // role comes from AuthProvider, which fetches it once for the whole app.
  const { user, role, isLoading: isAuthLoading } = useAuth();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAnimals = useCallback(async () => {
    const response = await fetch('/api/animals');
    if (!response.ok) throw new Error('Could not load animals.');

    const data: { animals: Animal[] } = await response.json();
    setAnimals(data.animals);
  }, []);

  // --- Load the animal list once the caller is known to be an administrator ---
  useEffect(() => {
    // Wait until both the session and the role have resolved.
    if (isAuthLoading || (user && role === null)) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        if (role === 'admin') await loadAnimals();
      } catch {
        if (!cancelled) setError('Could not load the dashboard. Please refresh to try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, user, role, loadAnimals]);

  /** Surface the server's own message so a 403 is shown to the user verbatim. */
  async function describeFailure(response: Response): Promise<string> {
    const payload = await response.json().catch(() => ({}));
    const details = Array.isArray(payload.details) ? ` ${payload.details.join(' ')}` : '';
    return `${payload.error ?? 'Request failed.'}${details}`;
  }

  // --- Create, update and delete ---

  async function handleCreate(values: Omit<Animal, 'id'>) {
    setError('');
    const response = await fetch('/api/animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setError(await describeFailure(response));
      return;
    }

    await loadAnimals();
    setMode({ kind: 'list' });
  }

  async function handleUpdate(id: string, values: Omit<Animal, 'id'>) {
    setError('');
    const response = await fetch(`/api/animals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setError(await describeFailure(response));
      return;
    }

    await loadAnimals();
    setMode({ kind: 'list' });
  }

  async function handleDelete(animal: Animal) {
    if (!window.confirm(`Delete ${animal.name}? This cannot be undone.`)) return;

    setError('');
    const response = await fetch(`/api/animals/${animal.id}`, { method: 'DELETE' });

    if (!response.ok) {
      setError(await describeFailure(response));
      return;
    }

    await loadAnimals();
  }

  // --- Rendering ---

  if (isAuthLoading || isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-500">Loading…</main>
    );
  }

  // Administrator-only content. The API enforces this independently of the UI.
  if (role !== 'admin') {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Administrators only</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Manage Animals</h2>
        {mode.kind === 'list' && (
          <button
            onClick={() => setMode({ kind: 'create' })}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition"
          >
            Add Animal
          </button>
        )}
      </div>

      {error && (
        <p className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-medium">
          {error}
        </p>
      )}

      {mode.kind === 'create' && (
        <AnimalForm
          submitLabel="Create Animal"
          onSubmit={handleCreate}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <AnimalForm
          initial={mode.animal}
          submitLabel="Save Changes"
          onSubmit={(values) => handleUpdate(mode.animal.id, values)}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'list' && (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Species</th>
                <th className="p-3 font-semibold">Habitat</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {animals.map((animal) => (
                <tr key={animal.id} className="border-t border-gray-100">
                  <td className="p-3 font-medium text-gray-800">{animal.name}</td>
                  <td className="p-3 text-gray-600">{animal.species}</td>
                  <td className="p-3 text-gray-600">{animal.habitat}</td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => setMode({ kind: 'edit', animal })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(animal)}
                      className="px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {animals.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No animals yet. Use “Add Animal” to create the first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
