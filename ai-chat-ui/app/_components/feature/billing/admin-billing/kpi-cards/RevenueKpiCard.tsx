import KPICard from '@/app/_components/ui/billing/KPICard';

interface KpiMetric {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
}

interface RevenueKpiCardProps {
  revenue: KpiMetric;
}

export default function RevenueKpiCard({ revenue }: RevenueKpiCardProps) {
  return (
    <KPICard
      title={revenue.label}
      value={revenue.value.toString()}
      subtitle={revenue.unit || ''}
      trend={
        revenue.change
          ? {
              value: revenue.change,
              isPositive: revenue.changeType === 'increase',
              period: '先月比',
            }
          : undefined
      }
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      }
      color="green"
    />
  );
}
