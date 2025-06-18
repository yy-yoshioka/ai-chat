import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              AI Chat
            </Link>
          </div>
          <div className="flex items-center space-x-4">
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
              href="/faq"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/faq') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              FAQ
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
