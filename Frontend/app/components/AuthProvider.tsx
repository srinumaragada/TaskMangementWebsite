// app/context/AuthContext.tsx
'use client';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { auth } from '@/app/lib/firebase';
import { User } from 'firebase/auth';

type AuthContextType = {
  user: User | null;
  displayName: string | null;
};

const AuthContext = createContext<AuthContextType>({ user: null, displayName: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setDisplayName(user?.displayName ?? null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, displayName }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => useContext(AuthContext);
