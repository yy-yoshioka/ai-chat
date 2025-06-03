import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace('/login');
    }
  }, [authenticated, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
