'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../_hooks/useAuth';
import { useEffect } from 'react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isActive = (path: string) => pathname?.startsWith(path) || false;

  // SuperAdmin权限检查
  useEffect(() => {
    if (!loading && (!user || user.role !== 'super_admin')) {
      // 如果不是SuperAdmin，重定向到普通管理页面或登录页
      if (user?.role === 'admin') {
        router.push('/admin/org-selector');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Unauthorized access
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス拒否</h1>
          <p className="text-gray-600 mb-4">SuperAdmin権限が必要です</p>
          <Link
            href="/"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    {
      title: 'システム概要',
      path: '/superadmin/dashboard',
      icon: '📊',
      description: 'システム全体のメトリクス',
    },
    {
      title: 'テナント管理',
      path: '/superadmin/tenants',
      icon: '🏢',
      description: '組織・テナントの管理',
    },
    {
      title: 'システムメトリクス',
      path: '/superadmin/metrics',
      icon: '📈',
      description: 'パフォーマンス監視',
    },
    {
      title: 'インシデント管理',
      path: '/superadmin/incidents',
      icon: '🚨',
      description: 'システム障害対応',
    },
    {
      title: 'ユーザー管理',
      path: '/superadmin/users',
      icon: '👥',
      description: '全ユーザーの管理',
    },
    {
      title: 'セキュリティ',
      path: '/superadmin/security',
      icon: '🔒',
      description: 'セキュリティ監視',
    },
    {
      title: 'システム設定',
      path: '/superadmin/settings',
      icon: '⚙️',
      description: 'グローバル設定',
    },
    {
      title: '監査ログ',
      path: '/superadmin/audit-logs',
      icon: '📋',
      description: 'システム監査ログ',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 shadow-2xl">
        <div className="p-6 border-b border-purple-700">
          <Link href="/superadmin/dashboard" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SuperAdmin</h1>
              <p className="text-sm text-purple-200">システム管理コンソール</p>
            </div>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'text-purple-100 hover:bg-purple-700 hover:text-white hover:scale-102'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium">{item.title}</span>
                    <p className="text-xs opacity-75 mt-0.5">{item.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-72 p-4 border-t border-purple-700 bg-purple-900">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'SuperAdmin'}
              </p>
              <p className="text-xs text-purple-200 truncate">システム管理者</p>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/profile"
              className="w-full text-center px-3 py-2 text-sm text-purple-100 hover:text-white hover:bg-purple-700 rounded-lg transition-colors block"
            >
              プロフィール設定
            </Link>
            <Link
              href="/"
              className="w-full text-center px-3 py-2 text-sm text-purple-100 hover:text-white hover:bg-purple-700 rounded-lg transition-colors block"
            >
              メインサイトに戻る
            </Link>
          </div>
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
              {/* System Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">システム正常</span>
              </div>

              {/* Global Actions */}
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

              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname.includes('/tenants')) return 'テナント管理';
  if (pathname.includes('/metrics')) return 'システムメトリクス';
  if (pathname.includes('/incidents')) return 'インシデント管理';
  if (pathname.includes('/users')) return 'ユーザー管理';
  if (pathname.includes('/security')) return 'セキュリティ監視';
  if (pathname.includes('/settings')) return 'システム設定';
  if (pathname.includes('/audit-logs')) return '監査ログ';
  if (pathname.includes('/dashboard')) return 'システム概要';
  return 'SuperAdmin コンソール';
}

function getPageDescription(pathname: string): string {
  if (pathname.includes('/tenants')) return '組織・テナントの作成、編集、削除、設定管理';
  if (pathname.includes('/metrics'))
    return 'システムパフォーマンス、リソース使用量、トラフィック監視';
  if (pathname.includes('/incidents')) return 'システム障害の検知、対応、解決管理';
  if (pathname.includes('/users')) return '全ユーザーアカウントの管理と権限設定';
  if (pathname.includes('/security')) return 'セキュリティイベント監視と脅威検知';
  if (pathname.includes('/settings')) return 'グローバル設定とシステム構成管理';
  if (pathname.includes('/audit-logs')) return 'システム全体の操作ログと監査証跡';
  if (pathname.includes('/dashboard')) return 'システム全体の健康状態と主要メトリクス';
  return 'AI Chatシステムの総合管理';
}
