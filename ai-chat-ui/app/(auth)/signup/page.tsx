'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupForm } from '@/app/_components/feature/auth/SignupForm';
import { useAuth } from '@/app/_hooks/auth/useAuth';

export default function SignupPage() {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  // 認証済みならプロフィールに戻す
  useEffect(() => {
    if (!loading && authenticated) router.replace('/profile');
  }, [authenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg border w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">新規登録</h1>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-slate-600">
          既にアカウントをお持ちですか？{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
            ログイン
          </a>
        </p>
      </div>
    </div>
  );
}
