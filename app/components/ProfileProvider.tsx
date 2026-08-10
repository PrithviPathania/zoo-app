'use client';

import { createContext, useContext, useRef, useCallback } from 'react';

interface ProfileContextType {
  getFavourite: (userId: string) => string | null;
  setFavourite: (userId: string, animalId: string) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  getFavourite: () => null,
  setFavourite: () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

export default function ProfileProvider({ children }: { children: React.ReactNode }) {
  // In-memory store — survives re-renders but not page refreshes.
  // Will be replaced with MongoDB later.
  const store = useRef<Map<string, string>>(new Map());

  const getFavourite = useCallback((userId: string): string | null => {
    return store.current.get(userId) ?? null;
  }, []);

  const setFavourite = useCallback((userId: string, animalId: string) => {
    store.current.set(userId, animalId);
  }, []);

  return (
    <ProfileContext.Provider value={{ getFavourite, setFavourite }}>
      {children}
    </ProfileContext.Provider>
  );
}
