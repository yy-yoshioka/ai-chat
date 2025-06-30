import { Incident } from '../types';

interface IncidentStatsProps {
  incidents: Incident[];
}

export function IncidentStats({ incidents }: IncidentStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <span className="text-2xl">🚨</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">アクティブ</p>
            <p className="text-2xl font-bold text-red-900">
              {incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">緊急/高</p>
            <p className="text-2xl font-bold text-orange-900">
              {incidents.filter((i) => i.severity === 'critical' || i.severity === 'high').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">✅</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">今日解決</p>
            <p className="text-2xl font-bold text-green-900">2</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">平均解決時間</p>
            <p className="text-2xl font-bold text-blue-900">2.5h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
