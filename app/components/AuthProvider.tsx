'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  /** Access level of the signed-in user, or null when signed out. */
  role: 'user' | 'admin' | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [fetchedRole, setFetchedRole] = useState<'user' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Load the access level from the database whenever the signed-in user changes.
  // Fetched once here so the navbar and the admin page share a single request.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadRole() {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Request failed');

        const profile: { role: 'user' | 'admin' } = await response.json();
        if (!cancelled) setFetchedRole(profile.role);
      } catch {
        // Fall back to the least privileged level rather than assuming admin.
        if (!cancelled) setFetchedRole('user');
      }
    }

    loadRole();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Derived rather than stored, so signing out cannot leave a stale role behind
  // and no state is written synchronously inside the effect above.
  const role = user ? fetchedRole : null;

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, role, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
