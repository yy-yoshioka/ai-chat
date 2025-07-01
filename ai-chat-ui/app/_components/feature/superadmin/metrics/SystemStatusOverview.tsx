import { SystemMetric } from '@/app/(super)/superadmin/metrics/page';

interface SystemStatusOverviewProps {
  metrics: SystemMetric[];
}

interface StatusCard {
  status: 'good' | 'warning' | 'critical';
  label: string;
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const statusCards: StatusCard[] = [
  {
    status: 'good',
    label: '正常',
    icon: '✅',
    color: 'green',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-100',
  },
  {
    status: 'warning',
    label: '警告',
    icon: '⚠️',
    color: 'yellow',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-100',
  },
  {
    status: 'critical',
    label: '緊急',
    icon: '🚨',
    color: 'red',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-100',
  },
];

export default function SystemStatusOverview({ metrics }: SystemStatusOverviewProps) {
  const getMetricCount = (status: 'good' | 'warning' | 'critical') => {
    return metrics.filter((m) => m.status === status).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statusCards.map((card) => (
        <div
          key={card.status}
          className={`bg-white rounded-lg shadow p-6 border-l-4 ${card.borderColor}`}
        >
          <div className="flex items-center">
            <div className={`p-2 ${card.bgColor} rounded-lg`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <p className={`text-2xl font-bold text-${card.color}-900`}>
                {getMetricCount(card.status)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
