import { useQuery } from '@tanstack/react-query';
import { BillingPlan, UsageData } from '@/app/_schemas/billing';

export function useBilling(orgId: string) {
  return useQuery({
    queryKey: ['billing', orgId],
    queryFn: async (): Promise<{
      plans: BillingPlan[];
      usage: UsageData;
    }> => {
      const [plansResponse, usageResponse] = await Promise.all([
        fetch(`/api/billing/plans`),
        fetch(`/api/billing/usage?orgId=${orgId}`),
      ]);

      if (!plansResponse.ok) {
        throw new Error('Failed to fetch billing plans');
      }
      if (!usageResponse.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const [plans, usage] = await Promise.all([plansResponse.json(), usageResponse.json()]);

      return { plans, usage };
    },
    staleTime: 60_000, // 1 minute
    enabled: !!orgId, // Only run if orgId is available
  });
}
