'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import { getRedirectPath } from '@/app/_utils/auth/redirect';
import { LOGIN_REDIRECT_DEFAULT, ADMIN_QUICK_CREDENTIALS } from '@/app/_config/auth/constants';

export const LoginForm: React.FC = () => {
  /** 入力値・状態 */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /** 認証フック */
  const { login } = useAuth();
  const router = useRouter();

  /* ---------------------------------- handlers ---------------------------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email と Password は必須です');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const ok = await login(email, password);
      if (!ok) throw new Error('Invalid email / password');

      router.push(getRedirectPath(LOGIN_REDIRECT_DEFAULT));
    } catch (err) {
      setError('ログインに失敗しました');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /** Dev-only: 管理者クイックログイン */
  const handleQuickLogin = async () => {
    try {
      setSubmitting(true);
      const ok = await login(ADMIN_QUICK_CREDENTIALS.email, ADMIN_QUICK_CREDENTIALS.password);
      if (ok) router.push('/admin/org-selector');
    } catch {
      setError('Admin ログイン失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------- view ---------------------------------- */
  return (
    <>
      {error && (
        <p className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6 text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* email */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-slate-800 text-sm font-semibold mb-2">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* password */}
        <div className="mb-8">
          <label htmlFor="password" className="block text-slate-800 text-sm font-semibold mb-2">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* login button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition ${
            submitting ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      {/* links */}
      <div className="mt-6 text-center text-sm text-slate-600">
        アカウント未登録？{' '}
        <Link href="/signup" className="text-green-600 hover:text-green-800 font-semibold">
          新規登録
        </Link>
      </div>

      {/* dev-only quick login */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 mb-3 text-center">開発用 - 管理者ログイン</p>
          <button
            onClick={handleQuickLogin}
            disabled={submitting}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? '管理者ログイン中...' : '🔧 管理者としてログイン'}
          </button>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link href="/faq" className="text-blue-600 hover:text-blue-800 text-sm">
          よくある質問
        </Link>
      </div>
    </>
  );
};
