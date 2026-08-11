'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function NavBar() {
  const { user, role, isLoading, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-[#c41e1b] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition">
          <span className="text-xl font-extrabold tracking-wide">Calgary Zoo Explorer</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center space-x-6 font-medium">
          <Link
            href="/"
            className={`hover:text-red-200 transition ${pathname === '/' ? 'border-b-2 border-white font-bold' : ''}`}
          >
            Home
          </Link>
          <Link
            href="/gallery"
            className={`hover:text-red-200 transition ${pathname === '/gallery' ? 'border-b-2 border-white font-bold' : ''}`}
          >
            Animal Gallery
          </Link>

          {/* Auth-dependent items */}
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className={`hover:text-red-200 transition ${pathname === '/profile' ? 'border-b-2 border-white font-bold' : ''}`}
                  >
                    Profile
                  </Link>

                  {/* Administrator-only link. The /admin page and the API both
                      re-check the role, so hiding it here is convenience, not security. */}
                  {role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`hover:text-red-200 transition ${pathname === '/admin' ? 'border-b-2 border-white font-bold' : ''}`}
                    >
                      Manage Animals
                    </Link>
                  )}
                  <span className="text-red-200 text-sm hidden md:inline">
                    {user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="ml-2 px-4 py-1.5 rounded-full border-2 border-white hover:bg-white hover:text-[#c41e1b] transition font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="ml-4 px-4 py-1.5 rounded-full border-2 border-white hover:bg-white hover:text-[#c41e1b] transition font-semibold"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}