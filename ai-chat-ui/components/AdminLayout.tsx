import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AdminAuthGuard from './AdminAuthGuard';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user } = useAuth();

  const isActive = (path: string) => router.pathname.startsWith(path);

  const sidebarItems = [
    {
      title: 'ダッシュボード',
      path: '/admin/dashboard',
      icon: '📊',
    },
    {
      title: 'FAQ管理',
      path: '/admin/faq',
      icon: '❓',
    },
    {
      title: 'ユーザー管理',
      path: '/admin/users',
      icon: '👥',
    },
    {
      title: 'チャット監視',
      path: '/admin/chats',
      icon: '💬',
    },
    {
      title: 'システム設定',
      path: '/admin/settings',
      icon: '⚙️',
    },
    {
      title: 'レポート',
      path: '/admin/reports',
      icon: '📈',
    },
    {
      title: 'ログ監視',
      path: '/admin/logs',
      icon: '📋',
    },
  ];

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🔧</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">管理者パネル</h1>
                <p className="text-sm text-gray-500">AI Chat Admin</p>
              </div>
            </Link>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || '管理者'}
                </p>
                <p className="text-xs text-gray-500 truncate">管理者権限</p>
              </div>
            </div>
            <Link
              href="/"
              className="mt-3 w-full text-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              メインサイトに戻る
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getPageTitle(router.pathname)}
                </h2>
                <p className="text-gray-600 mt-1">{getPageDescription(router.pathname)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5-5-5h5v-12z"
                    />
                  </svg>
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5-5-5h5v-12z"
                    />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
function getPageTitle(pathname: string): string {
  if (pathname.includes('/admin/dashboard')) return 'ダッシュボード';
  if (pathname.includes('/admin/faq')) return 'FAQ管理';
  if (pathname.includes('/admin/users')) return 'ユーザー管理';
  if (pathname.includes('/admin/chats')) return 'チャット監視';
  if (pathname.includes('/admin/settings')) return 'システム設定';
  if (pathname.includes('/admin/reports')) return 'レポート';
  if (pathname.includes('/admin/logs')) return 'ログ監視';
  return '管理者パネル';
}

function getPageDescription(pathname: string): string {
  if (pathname.includes('/admin/dashboard')) return 'システム全体の状況を監視';
  if (pathname.includes('/admin/faq')) return 'よくある質問の作成・編集・削除';
  if (pathname.includes('/admin/users')) return 'ユーザーアカウントの管理';
  if (pathname.includes('/admin/chats')) return 'チャット履歴とパフォーマンスの監視';
  if (pathname.includes('/admin/settings')) return 'システム設定とコンフィグレーション';
  if (pathname.includes('/admin/reports')) return '詳細なレポートと分析';
  if (pathname.includes('/admin/logs')) return 'システムログとエラー監視';
  return 'AI Chatシステムの管理';
}
