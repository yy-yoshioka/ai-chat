'use client';

import SystemStatusOverview from '@/app/_components/feature/superadmin/metrics/SystemStatusOverview';
import MetricCard from '@/app/_components/feature/superadmin/metrics/MetricCard';
import SystemActivity from '@/app/_components/feature/superadmin/metrics/SystemActivity';
import { useSystemMetrics } from '@/app/_hooks/superadmin/useSystemMetrics';

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

export default function MetricsPage() {
  const { metrics } = useSystemMetrics();

  return (
    <div className="space-y-6">
      <SystemStatusOverview metrics={metrics} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <SystemActivity />
    </div>
  );
}
