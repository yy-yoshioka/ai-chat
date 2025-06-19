import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const { authenticated, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!authenticated) {
        // 未認証の場合はログインページへリダイレクト
        router.replace('/login');
      } else if (!isAdmin) {
        // 認証済みだが管理者でない場合はメインページへリダイレクト
        router.replace('/');
      }
    }
  }, [authenticated, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証情報を確認しています...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">アクセス権限がありません</h3>
          <p className="text-gray-600 mb-6">このページにアクセスするには管理者権限が必要です。</p>
          <button
            onClick={() => router.replace('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            メインページに戻る
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
