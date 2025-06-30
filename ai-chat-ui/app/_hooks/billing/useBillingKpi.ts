import { useQuery } from '@tanstack/react-query';
import { BillingKpi } from '@/app/_schemas/billing';

// Query keys
const kpiKeys = {
  all: ['billing-kpi'] as const,
  dashboard: (orgId?: string) => [...kpiKeys.all, 'dashboard', orgId] as const,
};

/**
 * Hook to fetch billing KPI data
 */
export function useBillingKpi(organizationId?: string) {
  return useQuery({
    queryKey: kpiKeys.dashboard(organizationId),
    queryFn: async () => {
      // TODO: Replace with actual API endpoint when ready
      // const endpoint = `/api/billing/kpi${organizationId ? `?orgId=${organizationId}` : ''}`;
      // return fetchGet(endpoint, BillingKpiSchema);

      // Mock data for now
      return new Promise<BillingKpi>((resolve) => {
        setTimeout(() => {
          resolve({
            revenue: {
              label: '月間収益',
              value: '¥250,000',
              previousValue: '¥220,000',
              change: 13.6,
              changeType: 'increase',
              unit: '円',
            },
            activeSubscriptions: {
              label: 'アクティブ契約',
              value: 45,
              previousValue: 42,
              change: 7.1,
              changeType: 'increase',
              unit: '件',
            },
            churnRate: {
              label: '解約率',
              value: '2.3%',
              previousValue: '3.1%',
              change: -25.8,
              changeType: 'decrease',
              unit: '%',
            },
            averageRevenuePerUser: {
              label: 'ARPU',
              value: '¥5,556',
              previousValue: '¥5,238',
              change: 6.1,
              changeType: 'increase',
              unit: '円',
            },
            chartData: {
              labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
              revenue: [180000, 195000, 210000, 205000, 220000, 250000],
              subscriptions: [35, 37, 39, 40, 42, 45],
            },
          });
        }, 1000);
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
