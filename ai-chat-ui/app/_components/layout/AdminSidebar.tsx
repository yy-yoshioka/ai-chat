import Link from 'next/link';
import { createSidebarItems } from '@/app/_config/admin/navigation';
import type { User } from '@/app/_schemas/auth';

interface AdminSidebarProps {
  orgId: string;
  pathname: string;
  user: User | null;
}

export function AdminSidebar({ orgId, pathname, user }: AdminSidebarProps) {
  const sidebarItems = createSidebarItems(orgId);
  const isActive = (path: string) => pathname?.startsWith(path) || false;

  return (
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
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || '管理者'}</p>
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
  );
}
