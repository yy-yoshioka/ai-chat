'use client';

import React, { useState } from 'react';
import { useAuth } from '../_hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const isActive = (path: string) => pathname === path;

  const { user, authenticated, isAdmin, hasOrgPermission } = useAuth();

  // Mock organization data - replace with actual data
  const userOrganizations = [
    { id: 'org-demo', name: 'Demo Organization', role: 'owner' },
    { id: 'org-test', name: 'Test Company', role: 'org_admin' },
  ];

  const currentOrg = userOrganizations[0]; // In real app, get from context or URL

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getMenuItems = () => {
    const items = [
      { href: '/blog', label: 'Blog', requiresAuth: false },
      { href: '/status', label: 'Status', requiresAuth: false },
      { href: '/faq', label: 'FAQ', requiresAuth: false },
    ];

    if (authenticated) {
      items.push({ href: '/dashboard', label: 'Dashboard', requiresAuth: true });

      // Add admin menu items based on permissions
      if (isAdmin || (currentOrg && hasOrgPermission(currentOrg.id, 'viewer'))) {
        items.push({
          href: `/admin/${currentOrg?.id || 'default'}`,
          label: '管理者',
          requiresAuth: true,
        });
      }
    }

    return items;
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

            {/* Breadcrumbs for admin pages */}
            {pathname?.startsWith('/admin') && currentOrg && (
              <div className="ml-4 flex items-center space-x-2 text-sm text-gray-500">
                <span>/</span>
                <span>{currentOrg.name}</span>
                {pathname.includes('/dashboard') && (
                  <>
                    <span>/</span>
                    <span>ダッシュボード</span>
                  </>
                )}
                {pathname.includes('/widgets') && (
                  <>
                    <span>/</span>
                    <span>ウィジェット</span>
                  </>
                )}
                {pathname.includes('/users') && (
                  <>
                    <span>/</span>
                    <span>ユーザー</span>
                  </>
                )}
                {pathname.includes('/settings') && (
                  <>
                    <span>/</span>
                    <span>設定</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Menu items */}
            {getMenuItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href) || (item.label === '管理者' && pathname?.startsWith('/admin'))
                    ? item.label === '管理者'
                      ? 'bg-red-100 text-red-700 font-semibold'
                      : 'bg-blue-100 text-blue-700'
                    : item.label === '管理者'
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label === '管理者' ? (
                  <span className="flex items-center space-x-1">
                    <span>🔧</span>
                    <span>{item.label}</span>
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            ))}

            {/* Organization Switcher */}
            {authenticated && currentOrg && userOrganizations.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md transition-colors"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {currentOrg.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline">{currentOrg.name}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showOrgDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      {userOrganizations.map((org) => (
                        <button
                          key={org.id}
                          onClick={() => {
                            // In real app, switch organization context
                            setShowOrgDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            org.id === currentOrg.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {org.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{org.name}</div>
                              <div className="text-xs text-gray-500">{org.role}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile */}
            {authenticated && (
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

      {/* Close dropdown when clicking outside */}
      {showOrgDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowOrgDropdown(false)} />
      )}
    </nav>
  );
}
