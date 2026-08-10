'use client';

import type { Animal } from '@/lib/animals';

interface AnimalCardProps {
  animal: Animal;
  onSelect: (animal: Animal) => void;
}

export default function AnimalCard({ animal, onSelect }: AnimalCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col justify-between">
      <div>
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-52 object-cover"
        />
        <div className="p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-[#c41e1b]">
              {animal.habitat}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {animal.conservationStatus}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{animal.name}</h3>
          <p className="text-gray-600 font-medium text-sm mt-0.5">{animal.species}</p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <button
          onClick={() => onSelect(animal)}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 rounded-lg transition"
        >
          Explore Profile
        </button>
      </div>
    </div>
  );
}
