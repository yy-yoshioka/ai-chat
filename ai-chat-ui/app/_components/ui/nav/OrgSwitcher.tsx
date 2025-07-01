'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import { getUserInitials } from '@/app/_utils/navigation/nav-helpers';
import { useOrganizations } from '@/app/_hooks/org/useOrganizations';
/**
 * 簡易版 Organization Switcher
 * 実運用では GraphQL / REST で組織一覧を取得する Hook と組み合わせる
 */
export default function OrgSwitcher() {
  const { authenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const { orgs, loading } = useOrganizations();

  const currentOrg = orgs[0];

  /** クリック外しで閉じる */
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  // 未ログインなら非表示
  if (!authenticated) return null;
  if (!currentOrg) return null;
  if (loading) return null;

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md transition-colors"
      >
        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-medium">{getUserInitials(currentOrg.name)}</span>
        </div>
        <span className="hidden sm:inline">{currentOrg.name}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
        >
          {orgs.map((org) => (
            <li
              key={org.id}
              className={`px-4 py-3 cursor-pointer ${
                org.id === currentOrg.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={`text-sm font-medium ${org.id === currentOrg.id ? 'text-blue-700' : 'text-gray-900'}`}
                  >
                    {org.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {org.userCount} users • {org.widgetCount} widgets
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    org.plan === 'enterprise'
                      ? 'bg-purple-100 text-purple-700'
                      : org.plan === 'pro'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {org.plan}
                </span>
              </div>
            </li>
          ))}
          <li className="border-t border-gray-200 mt-1 pt-1">
            <a
              href="/organizations"
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
            >
              Manage organizations
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
