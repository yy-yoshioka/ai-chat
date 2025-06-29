import { getPageTitle, getPageDescription } from '@/app/_config/admin/navigation';
import { AdminTrialBadge } from './AdminTrialBadge';

interface AdminHeaderProps {
  pathname: string;
  orgId: string;
}

export function AdminHeader({ pathname, orgId }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getPageTitle(pathname)}</h2>
          <p className="text-gray-600 mt-1">{getPageDescription(pathname)}</p>
        </div>
        <div className="flex items-center space-x-4">
          <AdminTrialBadge orgId={orgId} />
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
  );
}
