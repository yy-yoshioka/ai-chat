import React from 'react';
import { useBillingKpi } from '@/app/_hooks/billing/useBillingKpi';

export function useKpiDashboard(organizationId?: string, refreshInterval = 300000) {
  const { data: kpiData, isLoading, error, refetch } = useBillingKpi(organizationId);
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());

  React.useEffect(() => {
    // Set up periodic refresh
    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, refetch]);

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  return {
    kpiData,
    isLoading,
    error,
    lastUpdated,
    handleRefresh,
  };
}
