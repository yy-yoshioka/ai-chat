import { Tenant } from '../types';

interface TenantStatsProps {
  tenants: Tenant[];
}

export function TenantStats({ tenants }: TenantStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-2xl">🏢</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">総テナント数</p>
            <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">✅</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">アクティブ</p>
            <p className="text-2xl font-bold text-gray-900">
              {tenants.filter((t) => t.status === 'active').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg">
            <span className="text-2xl">⏰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">トライアル</p>
            <p className="text-2xl font-bold text-gray-900">
              {tenants.filter((t) => t.status === 'trial').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">👥</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
            <p className="text-2xl font-bold text-gray-900">
              {tenants.reduce((sum, t) => sum + t.userCount, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
