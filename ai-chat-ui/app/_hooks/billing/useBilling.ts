import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { BillingPlanSchema, type EnhancedBillingPlan } from '@/app/_schemas/billing';
import { fetchGet, fetchPost } from '@/app/_utils/fetcher';

// Response schemas
const UsageDataSchema = z.object({
  messages: z.number(),
  users: z.number(),
  storage: z.number(),
  apiCalls: z.number(),
  limits: z.object({
    messages: z.number(),
    users: z.number(),
    storage: z.number(),
    apiCalls: z.number(),
  }),
});

const BillingDataSchema = z.object({
  plan: BillingPlanSchema,
  usage: UsageDataSchema,
  subscription: z
    .object({
      id: z.string(),
      status: z.enum(['active', 'trialing', 'past_due', 'canceled']),
      currentPeriodEnd: z.string(),
      cancelAtPeriodEnd: z.boolean(),
    })
    .optional(),
});

type BillingData = z.infer<typeof BillingDataSchema>;

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
    queryFn: () => fetchGet('/api/bff/billing', z.array(BillingPlanSchema)),
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
      const plans = await fetchGet('/api/bff/billing', z.array(BillingPlanSchema));

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
    mutationFn: ({ planId, orgId }: { planId: string; orgId: string }) =>
      fetchPost('/api/bff/billing', z.object({ success: z.boolean() }), { planId }),
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
      fetchPost('/api/bff/billing/cancel', z.object({ success: z.boolean() }), { orgId }),
    onSuccess: (_, orgId) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.current(orgId) });
    },
  });
}
