'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../_hooks/auth/useAuth';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      router.replace('/login');
    };
    doLogout();
  }, [logout, router]);

  return <p className="p-4">Logging out...</p>;
}
