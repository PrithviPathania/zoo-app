'use client';

import type { Animal } from '@/lib/animals';

interface AnimalProfileModalProps {
  animal: Animal | null;
  onClose: () => void;
}

export default function AnimalProfileModal({ animal, onClose }: AnimalProfileModalProps) {
  if (!animal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
     
        <img src={animal.image} alt={animal.name} className="w-full h-64 object-cover" />

        <div className="p-6">
          <span className="bg-red-100 text-[#c41e1b] text-xs font-bold px-3 py-1 rounded-full uppercase">
            {animal.habitat}
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-2">{animal.name}</h2>
          <p className="text-gray-600 font-semibold text-lg">{animal.species}</p>

          <div className="mt-4 space-y-2 text-gray-700 text-sm border-t border-b py-3 my-3">
            <p><strong>Diet:</strong> {animal.diet}</p>
            <p><strong>Status:</strong> {animal.conservationStatus}</p>
            <p className="pt-1"><strong>Educational Profile:</strong> {animal.description}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-800 text-white font-bold py-2.5 rounded-xl hover:bg-gray-900 transition mt-2"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
