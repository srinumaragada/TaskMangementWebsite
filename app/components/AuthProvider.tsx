'use client';
import { useEffect } from 'react';
import { auth } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        console.log('User is logged in:', user);
      } else {
        // User is signed out
        console.log('User is logged out');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}