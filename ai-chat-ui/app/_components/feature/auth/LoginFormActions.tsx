import Link from 'next/link';

interface LoginFormActionsProps {
  submitting: boolean;
  onQuickLogin: () => void;
}

export function LoginFormActions({ submitting, onQuickLogin }: LoginFormActionsProps) {
  return (
    <>
      <div className="mt-6 text-center text-sm text-slate-600">
        アカウント未登録？{' '}
        <Link href="/signup" className="text-green-600 hover:text-green-800 font-semibold">
          新規登録
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 mb-3 text-center">開発用 - 管理者ログイン</p>
          <button
            onClick={onQuickLogin}
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
}
