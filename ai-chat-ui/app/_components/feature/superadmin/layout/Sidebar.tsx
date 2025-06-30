import Link from 'next/link';
import { User } from '@/app/_hooks/auth/useAuth';

interface SidebarItem {
  title: string;
  path: string;
  icon: string;
  description: string;
}

interface SidebarProps {
  pathname: string;
  user: User | null;
}

const sidebarItems: SidebarItem[] = [
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

export default function Sidebar({ pathname, user }: SidebarProps) {
  const isActive = (path: string) => pathname?.startsWith(path) || false;

  return (
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
            <p className="text-sm font-medium text-white truncate">{user?.name || 'SuperAdmin'}</p>
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
  );
}
