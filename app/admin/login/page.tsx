'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/components/AuthProvider';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  // If already logged in, redirect to the admin dashboard
  useEffect(() => {
    if (user) {
      router.replace('/admin');
    }
  }, [user, router]);

  async function signInWith(provider: 'google' | 'github') {
    await supabase.auth.signInWithOAuth({
      provider: provider,
      // Redirect straight to the admin dashboard instead of the homepage
      options: { redirectTo: `${window.location.origin}/admin` },
    });
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <div className="mb-6 text-center">
        <span className="bg-red-100 text-[#c41e1b] text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wide inline-block mb-3">
          Staff Portal
        </span>
        <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
      </div>

      {/* OAuth Providers */}
      <div className="space-y-3">
        <button
          onClick={() => signInWith('google')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          <GoogleIcon />
          Sign in with Google (Zoo Account)
        </button>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Brand logos as small SVG components
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
