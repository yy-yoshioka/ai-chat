import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGet, fetchPost } from '@/app/_utils/fetcher';
import { billingPlanSchema, SuccessResponseSchema, CancelResponseSchema } from '@/app/_schemas';

// Query keys factory
const billingKeys = {
  all: ['billing'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  current: (orgId: string) => [...billingKeys.all, 'current', orgId] as const,
  usage: (orgId: string) => [...billingKeys.all, 'usage', orgId] as const,
};

/**
 * Hook to fetch all available billing plans
 */
export function useBillingPlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => fetchGet('/api/bff/billing', billingPlanSchema.array()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch current billing data for an organization
 * This is the main hook used by billing pages
 */
export function useBilling(orgId: string) {
  return useQuery({
    queryKey: billingKeys.current(orgId),
    queryFn: async () => {
      // Fetch plans from BFF
      const plans = await fetchGet('/api/bff/billing', billingPlanSchema.array());

      // TODO: Replace with actual BFF endpoint when ready
      // For now, return mock data structure matching the component expectations
      const currentPlan = plans.find((p) => p.tier === 'pro') || plans[0];

      return {
        plan: currentPlan,
        usage: {
          messages: 1500,
          users: 3,
          storage: 2.5,
          apiCalls: 15000,
          limits: {
            messages: currentPlan.limits.messages,
            users: currentPlan.limits.users,
            storage: currentPlan.limits.storage,
            apiCalls: currentPlan.limits.apiCalls,
          },
        },
        subscription: {
          id: 'sub_mock_123',
          status: 'active' as const,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
        },
      };
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!orgId,
  });
}

/**
 * Hook to update billing plan
 */
export function useUpdateBillingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId }: { planId: string; orgId: string }) =>
      fetchPost('/api/bff/billing', SuccessResponseSchema, { planId }),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: billingKeys.current(variables.orgId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.usage(variables.orgId) });
    },
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgId: string) =>
      fetchPost('/api/bff/billing/cancel', CancelResponseSchema, { orgId }),
    onSuccess: (_, orgId) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.current(orgId) });
    },
  });
}
