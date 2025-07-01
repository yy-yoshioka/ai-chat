import KPICard from '@/app/_components/ui/billing/KPICard';

interface KpiMetric {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
}

interface SubscriptionsKpiCardProps {
  activeSubscriptions: KpiMetric;
}

export default function SubscriptionsKpiCard({ activeSubscriptions }: SubscriptionsKpiCardProps) {
  return (
    <KPICard
      title={activeSubscriptions.label}
      value={activeSubscriptions.value.toString()}
      subtitle={activeSubscriptions.unit || ''}
      trend={
        activeSubscriptions.change
          ? {
              value: activeSubscriptions.change,
              isPositive: activeSubscriptions.changeType === 'increase',
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
      color="blue"
    />
  );
}
