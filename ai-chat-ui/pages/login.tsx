import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const router = useRouter();
  const { login, authenticated, loading } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Email and password are required');
      return;
    }

    try {
      setIsLoggingIn(true);
      setErrorMessage('');

      const success = await login(email, password);

      if (success) {
        // Redirect to the page they were trying to access, or to the dashboard
        const redirectPath = (router.query.from as string) || '/profile';
        router.push(redirectPath);
      } else {
        setErrorMessage('Invalid email or password');
      }
    } catch (error) {
      setErrorMessage('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
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
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-slate-700 text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh] py-12 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">ログイン</h1>
            <p className="text-slate-600">アカウントにログインしてください</p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-slate-800 text-sm font-semibold mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="password" className="block text-slate-800 text-sm font-semibold mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-colors ${
                isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoggingIn ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              アカウントをお持ちでない方は{' '}
              <Link href="/signup" className="text-green-600 hover:text-green-800 font-semibold">
                新規登録
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
    </Layout>
  );
}
