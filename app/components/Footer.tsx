'use client';

import { useAuth } from './AuthProvider';

export default function Footer() {
  const { user, isLoading } = useAuth();

  return (
    <footer className="bg-[#c41e1b] text-white py-6 mt-12 text-center text-sm border-t border-[#a31816]">
      <p>© 2026 Calgary Zoo</p>
      {!isLoading && !user && (
        <div className="mt-2">
          <a href="/admin/login" className="text-red-200 hover:text-white transition">Staff Login</a>
        </div>
      )}
    </footer>
  );
}
