import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

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
