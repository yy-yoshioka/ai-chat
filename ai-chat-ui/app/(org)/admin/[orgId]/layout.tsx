'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../../_hooks/auth/useAuth';
import OrgAdminGuard from '@/app/_components/guard/OrgAdminGuard';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    orgId: string;
  }>;
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Use React.use() to unwrap the params Promise
  const { orgId } = React.use(params);

  const isActive = (path: string) => pathname?.startsWith(path) || false;

  const sidebarItems = [
    {
      title: 'ダッシュボード',
      path: `/admin/${orgId}/dashboard`,
      icon: '📊',
    },
    {
      title: 'ウィジェット',
      path: `/admin/${orgId}/widgets`,
      icon: '🧩',
    },
    {
      title: 'チャット',
      path: `/admin/${orgId}/chats`,
      icon: '💬',
    },
    {
      title: 'FAQ管理',
      path: `/admin/${orgId}/faq`,
      icon: '❓',
    },
    {
      title: 'ユーザー管理',
      path: `/admin/${orgId}/users`,
      icon: '👥',
    },
    {
      title: 'レポート',
      path: `/admin/${orgId}/reports`,
      icon: '📈',
    },
    {
      title: '請求・利用状況',
      path: `/admin/${orgId}/billing`,
      icon: '💳',
    },
    {
      title: 'ログ監視',
      path: `/admin/${orgId}/logs`,
      icon: '📋',
    },
    {
      title: '設定',
      path: `/admin/${orgId}/settings`,
      icon: '⚙️',
    },
  ];

  return (
    <OrgAdminGuard orgId={orgId} requiredRole="viewer">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <Link href={`/admin/${orgId}/dashboard`} className="flex items-center space-x-3">
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
                <h2 className="text-2xl font-bold text-gray-900">{getPageTitle(pathname || '')}</h2>
                <p className="text-gray-600 mt-1">{getPageDescription(pathname || '')}</p>
              </div>
              <div className="flex items-center space-x-4">
                <TrialBadge orgId={orgId} />
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
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </OrgAdminGuard>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.includes('/dashboard')) return 'ダッシュボード';
  if (pathname.includes('/widgets')) return 'ウィジェット管理';
  if (pathname.includes('/faq')) return 'FAQ管理';
  if (pathname.includes('/users')) return 'ユーザー管理';
  if (pathname.includes('/chats')) return 'チャット監視';
  if (pathname.includes('/reports')) return 'レポート';
  if (pathname.includes('/billing')) return '請求・利用状況';
  if (pathname.includes('/logs')) return 'ログ監視';
  if (pathname.includes('/settings')) return '設定';
  return '管理者パネル';
}

function getPageDescription(pathname: string): string {
  if (pathname.includes('/dashboard')) return 'システム全体の状況を監視';
  if (pathname.includes('/widgets')) return 'チャットウィジェットの作成・管理';
  if (pathname.includes('/faq')) return 'よくある質問の作成・編集・削除';
  if (pathname.includes('/users')) return 'ユーザーアカウントの管理';
  if (pathname.includes('/chats')) return 'チャット履歴とパフォーマンスの監視';
  if (pathname.includes('/reports')) return '詳細なレポートと分析';
  if (pathname.includes('/billing')) return '請求情報と利用状況の確認';
  if (pathname.includes('/logs')) return 'システムログとエラー監視';
  if (pathname.includes('/settings')) return '組織設定の管理';
  return 'AI Chatシステムの管理';
}

// Trial Badge Component
function TrialBadge({ orgId }: { orgId: string }) {
  // This would normally come from your organization/trial context
  // For now, using mock data - you should replace with actual trial data
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

  const today = new Date();
  const timeDiff = trialEndDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Don't show badge if trial period is over or if no trial
  if (daysLeft <= 0) return null;

  return (
    <Link
      href={`/admin/${orgId}/billing`}
      className="flex items-center px-3 py-1.5 bg-orange-100 hover:bg-orange-200 border border-orange-300 rounded-full text-orange-800 text-sm font-medium transition-colors"
    >
      <span className="mr-1">⏰</span>
      Trial <span className="font-bold mx-1">{daysLeft}</span> days left
      <span className="ml-1">▸ Upgrade</span>
    </Link>
  );
}
