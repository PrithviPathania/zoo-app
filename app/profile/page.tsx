'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useProfile } from '../components/ProfileProvider';
import { zooAnimals } from '@/lib/animals';
import type { Animal } from '@/lib/animals';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { getFavourite, setFavourite } = useProfile();

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [savedAnimal, setSavedAnimal] = useState<Animal | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Protect page — redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Load saved favourite on mount (when user is available)
  useEffect(() => {
    if (user) {
      const favId = getFavourite(user.id);
      if (favId) {
        const animal = zooAnimals.find((a) => a.id === favId) ?? null;
        setSavedAnimal(animal);
        setSelectedAnimalId(favId);
      }
    }
  }, [user, getFavourite]);

  function handleSave() {
    if (!user || !selectedAnimalId) return;

    setFavourite(user.id, selectedAnimalId);
    const animal = zooAnimals.find((a) => a.id === selectedAnimalId) ?? null;
    setSavedAnimal(animal);
    setSaveMessage('Favourite animal saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  }

  // Loading state
  if (isLoading) {
    return <main className="max-w-md mx-auto px-6 py-16 text-center text-gray-500">Loading…</main>;
  }

  // Redirecting (no user)
  if (!user) return null;

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900">Your Profile</h2>
        <p className="text-gray-500 mt-2">
          Signed in as <strong className="text-gray-800">{user.email}</strong>
        </p>
      </div>

      {/* Favourite Animal Selector */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🐾 Choose Your Favourite Animal</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="flex-1 p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-gray-400 outline-none font-medium"
          >
            <option value="">Select an animal...</option>
            {zooAnimals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} — {animal.species}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            disabled={!selectedAnimalId}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>

        {/* Success message */}
        {saveMessage && (
          <p className="mt-3 text-sm text-gray-700 bg-gray-100 rounded-lg p-2.5 text-center font-medium">
            ✓ {saveMessage}
          </p>
        )}
      </div>

      {/* Saved Animal Display Card */}
      {savedAnimal && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <img
            src={savedAnimal.image}
            alt={savedAnimal.name}
            className="w-full max-h-80 object-contain bg-gray-100"
          />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-[#c41e1b]">
                {savedAnimal.habitat}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {savedAnimal.conservationStatus}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{savedAnimal.name}</h3>
            <p className="text-gray-600 font-medium text-sm mt-0.5">{savedAnimal.species}</p>

            <div className="mt-4 space-y-1 text-gray-600 text-sm border-t pt-4">
              <p><strong>Diet:</strong> {savedAnimal.diet}</p>
              <p className="pt-1">{savedAnimal.description}</p>
            </div>

            <div className="mt-4 bg-gray-100 rounded-lg p-3 text-center">
              <p className="text-gray-800 font-semibold text-sm">
                ⭐ This is your favourite animal!
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
