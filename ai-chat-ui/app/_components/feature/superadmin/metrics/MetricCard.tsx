import { SystemMetric } from '@/app/(super)/superadmin/metrics/page';

interface MetricCardProps {
  metric: SystemMetric;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
      default:
        return '❓';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(metric.status)}`}>
          {getStatusIcon(metric.status)} {metric.status.toUpperCase()}
        </span>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</span>
        <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${getChangeColor(metric.change)}`}>
          {metric.change > 0 ? '+' : ''}
          {metric.change.toFixed(1)}%
        </span>
        <span className="text-gray-500">
          {new Date(metric.lastUpdated).toLocaleTimeString('ja-JP')}
        </span>
      </div>
    </div>
  );
}
