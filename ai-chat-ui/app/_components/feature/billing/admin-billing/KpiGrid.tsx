import KPICard from '@/app/_components/ui/billing/KPICard';
import RevenueKpiCard from './kpi-cards/RevenueKpiCard';
import SubscriptionsKpiCard from './kpi-cards/SubscriptionsKpiCard';

interface KpiMetric {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
}

interface KpiData {
  revenue: KpiMetric;
  activeSubscriptions: KpiMetric;
  churnRate: KpiMetric;
  averageRevenuePerUser: KpiMetric;
}

interface KpiGridProps {
  kpiData: KpiData;
}

export default function KpiGrid({ kpiData }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RevenueKpiCard revenue={kpiData.revenue} />
      <SubscriptionsKpiCard activeSubscriptions={kpiData.activeSubscriptions} />

      {/* Churn Rate KPI */}
      <KPICard
        title={kpiData.churnRate.label}
        value={kpiData.churnRate.value.toString()}
        subtitle={kpiData.churnRate.unit || ''}
        trend={
          kpiData.churnRate.change
            ? {
                value: Math.abs(kpiData.churnRate.change),
                isPositive: kpiData.churnRate.changeType === 'decrease',
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
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
          </svg>
        }
        color="red"
      />

      {/* ARPU KPI */}
      <KPICard
        title={kpiData.averageRevenuePerUser.label}
        value={kpiData.averageRevenuePerUser.value.toString()}
        subtitle={kpiData.averageRevenuePerUser.unit || ''}
        trend={
          kpiData.averageRevenuePerUser.change
            ? {
                value: kpiData.averageRevenuePerUser.change,
                isPositive: kpiData.averageRevenuePerUser.changeType === 'increase',
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        }
        color="purple"
      />
    </div>
  );
}
