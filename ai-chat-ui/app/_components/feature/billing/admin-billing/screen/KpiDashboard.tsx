import KpiHeader from '@/app/_components/feature/billing/admin-billing/KpiHeader';
import KpiLoadingState from '@/app/_components/feature/billing/admin-billing/KpiLoadingState';
import KpiErrorState from '@/app/_components/feature/billing/admin-billing/KpiErrorState';
import KpiGrid from '@/app/_components/feature/billing/admin-billing/KpiGrid';
import KpiInsights from '@/app/_components/feature/billing/admin-billing/KpiInsights';
import { useKpiDashboard } from '@/app/_hooks/billing/useKpiDashboard';

interface BillingKPIDashboardProps {
  organizationId?: string;
  refreshInterval?: number;
}

export default function BillingKPIDashboard({
  organizationId,
  refreshInterval = 300000, // 5分間隔
}: BillingKPIDashboardProps) {
  const { kpiData, isLoading, error, lastUpdated, handleRefresh } = useKpiDashboard(
    organizationId,
    refreshInterval
  );

  if (isLoading) {
    return <KpiLoadingState />;
  }

  if (error) {
    return <KpiErrorState error={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="space-y-6">
      <KpiHeader lastUpdated={lastUpdated} onRefresh={handleRefresh} isLoading={isLoading} />

      {kpiData && (
        <>
          <KpiGrid kpiData={kpiData} />
          <KpiInsights />
        </>
      )}
    </div>
  );
}
