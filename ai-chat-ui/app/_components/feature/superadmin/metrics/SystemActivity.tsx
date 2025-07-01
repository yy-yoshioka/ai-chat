interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'success',
    message: 'システム正常稼働中',
    timestamp: '2024-01-20 10:30:00',
    icon: '✅',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    id: '2',
    type: 'warning',
    message: 'メモリ使用率が閾値を超過',
    timestamp: '2024-01-20 10:25:00',
    icon: '⚠️',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
  },
  {
    id: '3',
    type: 'critical',
    message: 'データベース接続数が上限に近づいています',
    timestamp: '2024-01-20 10:20:00',
    icon: '🚨',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
  },
  {
    id: '4',
    type: 'info',
    message: '定期メンテナンス完了',
    timestamp: '2024-01-20 10:15:00',
    icon: '📊',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
];

export default function SystemActivity() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">システムアクティビティ</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-center space-x-3 p-3 ${activity.bgColor} rounded-lg`}
            >
              <span className={activity.textColor}>{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
