'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-red-50 to-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <span className="bg-red-100 text-[#c41e1b] text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wide inline-block">
          Virtual Zoo Experience
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
          Explore Calgary Zoo&apos;s Wildlife Worldwide
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Discover high-resolution galleries and educational resource profiles of animals across the Calgary Zoo habitats from anywhere on earth.
        </p>
        <div>
          <Link
            href="/gallery"
            className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-bold text-lg px-8 py-3.5 rounded-xl shadow-lg transition"
          >
            Browse Animal Gallery 🐾
          </Link>
        </div>
      </div>
    </div>
  );
}
