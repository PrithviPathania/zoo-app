'use client';

import { useState, useEffect } from 'react';
import type { Animal } from '@/lib/animals';
import AnimalCard from '../components/AnimalCard';
import AnimalProfileModal from '../components/AnimalProfileModal';

export default function GalleryPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedHabitat, setSelectedHabitat] = useState<string>('All');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  // Load the animals from the REST API once, when the page mounts.
  useEffect(() => {
    let cancelled = false;

    async function loadAnimals() {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch('/api/animals');
        if (!response.ok) throw new Error('Request failed');

        const data: { animals: Animal[] } = await response.json();
        if (!cancelled) setAnimals(data.animals);
      } catch {
        if (!cancelled) setLoadError('Could not load animals. Please refresh to try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAnimals();

    // Guards against setting state after the component has unmounted.
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter & Search Logic
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHabitat = selectedHabitat === 'All' || animal.habitat === selectedHabitat;
    return matchesSearch && matchesHabitat;
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAnimals = filteredAnimals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Virtual Animal Gallery</h2>
        <p className="text-gray-600 mt-2">Filter by habitat or search for your favorite Calgary Zoo resident.</p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Search by animal name or species..."
          className="p-3 border border-gray-200 rounded-lg flex-1 focus:ring-2 focus:ring-gray-400 outline-none"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-gray-400 outline-none font-medium"
          value={selectedHabitat}
          onChange={(e) => {
            setSelectedHabitat(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Habitats</option>
          <option value="Canadian Wilds">Canadian Wilds</option>
          <option value="Penguin Plunge">Penguin Plunge</option>
          <option value="Destination Africa">Destination Africa</option>
          <option value="Eurasia">Eurasia</option>
        </select>
      </div>

      {/* Loading state or Gallery Grid */}
      {isLoading ? (
        <p className="text-center text-gray-700 font-semibold py-12">Loading Calgary Zoo Animals...</p>
      ) : loadError ? (
        <p className="text-center text-red-700 bg-red-50 border border-red-200 rounded-lg py-6 px-4 font-medium">
          {loadError}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentAnimals.length > 0 ? (
              currentAnimals.map((animal) => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  onSelect={setSelectedAnimal}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-12">No animals found matching your search criteria.</p>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-10">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg disabled:opacity-40 hover:bg-gray-200 transition"
              >
                Previous
              </button>
              <span className="font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg disabled:opacity-40 hover:bg-gray-200 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detailed Profile Modal */}
      <AnimalProfileModal
        animal={selectedAnimal}
        onClose={() => setSelectedAnimal(null)}
      />
    </div>
  );
}
