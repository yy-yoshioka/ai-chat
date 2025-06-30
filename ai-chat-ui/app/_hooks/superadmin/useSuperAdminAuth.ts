import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_hooks/auth/useAuth';

export function useSuperAdminAuth() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'super_admin')) {
      // Redirect based on user role
      if (user?.role === 'admin') {
        router.push('/admin/org-selector');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return { user, loading, isAuthorized: user?.role === 'super_admin' };
}
