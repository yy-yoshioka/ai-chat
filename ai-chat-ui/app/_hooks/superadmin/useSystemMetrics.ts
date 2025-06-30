import { useState } from 'react';
import { SystemMetric } from '@/app/(super)/superadmin/metrics/page';

const initialMetrics: SystemMetric[] = [
  {
    id: 'cpu',
    name: 'CPU使用率',
    value: 45.2,
    unit: '%',
    change: +2.3,
    status: 'good',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
  {
    id: 'memory',
    name: 'メモリ使用率',
    value: 67.8,
    unit: '%',
    change: +5.1,
    status: 'warning',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
  {
    id: 'disk',
    name: 'ディスク使用率',
    value: 23.4,
    unit: '%',
    change: +1.2,
    status: 'good',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
  {
    id: 'network',
    name: 'ネットワーク転送量',
    value: 1.2,
    unit: 'GB/s',
    change: -0.8,
    status: 'good',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
  {
    id: 'response_time',
    name: '平均レスポンス時間',
    value: 245,
    unit: 'ms',
    change: +15.2,
    status: 'warning',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
  {
    id: 'error_rate',
    name: 'エラー率',
    value: 0.02,
    unit: '%',
    change: -0.01,
    status: 'good',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
  {
    id: 'active_users',
    name: 'アクティブユーザー数',
    value: 1234,
    unit: 'users',
    change: +8.5,
    status: 'good',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
  {
    id: 'database_connections',
    name: 'データベース接続数',
    value: 89,
    unit: 'connections',
    change: +12.3,
    status: 'critical',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
];

export function useSystemMetrics() {
  const [metrics] = useState<SystemMetric[]>(initialMetrics);

  return { metrics };
}
