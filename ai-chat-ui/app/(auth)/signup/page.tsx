'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../_hooks/useAuth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const router = useRouter();
  const { signup, authenticated, loading } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('メールアドレスとパスワードは必須です');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      setIsSigningUp(true);
      setErrorMessage('');

      const success = await signup(email, password, name || undefined);

      if (success) {
        // Redirect to the onboarding plan selection after successful signup
        router.push('/onboarding/step-plan');
      } else {
        setErrorMessage('新規登録に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      setErrorMessage('新規登録中にエラーが発生しました');
      console.error('Signup error:', error);
    } finally {
      setIsSigningUp(false);
    }
  };

  // If already authenticated, redirect to profile
  useEffect(() => {
    if (!loading && authenticated) {
      router.push('/profile');
    }
  }, [authenticated, loading, router]);

  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-slate-700 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">新規登録</h1>
          <p className="text-slate-600">アカウントを作成してAIチャットを始めましょう</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-slate-800 text-sm font-semibold mb-2">
              お名前 (任意)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white transition-colors"
              placeholder="山田 太郎"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-slate-800 text-sm font-semibold mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-slate-800 text-sm font-semibold mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white transition-colors"
              placeholder="••••••••"
              minLength={6}
            />
            <p className="text-xs text-slate-500 mt-1">6文字以上で入力してください</p>
          </div>

          <div className="mb-8">
            <label
              htmlFor="confirmPassword"
              className="block text-slate-800 text-sm font-semibold mb-2"
            >
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white transition-colors"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className={`w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-colors ${
              isSigningUp ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSigningUp ? '登録中...' : '新規登録'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            既にアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
              ログイン
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/faq" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            よくある質問
          </Link>
        </div>
      </div>
    </div>
  );
}
