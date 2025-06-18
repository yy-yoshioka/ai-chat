import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  const { user, authenticated } = useAuth();
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI Chat</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Always visible links */}
            <Link
              href="/faq"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/faq') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              FAQ
            </Link>

            {/* Authenticated user links */}
            {authenticated && (
              <>
                <Link
                  href="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Chat
                </Link>
                <Link
                  href="/widgets"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/widgets')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Widgets
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials(user?.name)}
                    </span>
                  </div>
                  <span className="hidden sm:inline">
                    {user?.name ? user.name.split(' ')[0] : 'プロフィール'}
                  </span>
                </Link>
              </>
            )}

            {/* Non-authenticated user links */}
            {!authenticated && (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    isActive('/login')
                      ? 'bg-blue-100 text-blue-700 rounded-md'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
