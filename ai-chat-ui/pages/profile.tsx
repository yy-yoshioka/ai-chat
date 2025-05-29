import { withAuth } from '../lib/withAuth';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';

function ProfilePage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Chat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/chat"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Chat
              </Link>
              <Link
                href="/faq"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="text-white">
                <h1 className="text-3xl font-bold">{user?.name || 'ユーザー'}</h1>
                <p className="text-blue-100 mt-1">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm text-blue-100">オンライン</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Account Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  アカウント情報
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">表示名</p>
                      <p className="font-medium text-gray-900">{user?.name || '未設定'}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">メールアドレス</p>
                      <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">最終ログイン</p>
                      <p className="font-medium text-gray-900">今すぐ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  クイックアクション
                </h2>

                <div className="grid gap-4">
                  <Link
                    href="/chat"
                    className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <div>
                      <h3 className="font-medium text-gray-900">チャットを開始</h3>
                      <p className="text-sm text-gray-600">AIとの会話を始める</p>
                    </div>
                  </Link>

                  <Link
                    href="/faq"
                    className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">FAQ を見る</h3>
                      <p className="text-sm text-gray-600">よくある質問を確認</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">アカウント管理</h3>
                  <p className="text-sm text-gray-600 mt-1">セッション管理とアカウント設定</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>ログアウト</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protect this page with authentication
export default withAuth(ProfilePage);
