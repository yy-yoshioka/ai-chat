'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/app/_components/feature/auth/LoginForm';
import { useAuth } from '@/app/_hooks/auth/useAuth';

export default function LoginPage() {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  // 既にログイン済みなら /profile へ
  useEffect(() => {
    if (!loading && authenticated) {
      router.replace('/profile');
    }
  }, [authenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg border w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">ログイン</h1>
        <LoginForm />
      </div>
    </div>
  );
}
