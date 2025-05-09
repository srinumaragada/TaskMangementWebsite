'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface CheckAuthProps {
  isAuthenticated: boolean;
  children: ReactNode;
}

const CheckAuth = ({ isAuthenticated, children }: CheckAuthProps) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname.startsWith('/Pages/dashboard')) {
      router.push('/');
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && pathname.startsWith('/Pages/dashboard')) {
    return null;
  }

  return <>{children}</>;
};

export default CheckAuth;
