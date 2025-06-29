// app/_hooks/billing/useCheckout.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchPost } from '@/app/_utils/fetcher';

// Response schema
const CheckoutResponseSchema = z.object({
  sessionUrl: z.string(),
});

// Request type
type CheckoutRequest = {
  priceId: string;
  organizationId?: string;
  planId?: string;
};

export interface CheckoutState {
  loading: boolean;
  processingId: string | null;
  checkout: (priceId: string, orgId?: string) => Promise<void>;
}

/**
 * Hook to create a checkout session for billing
 */
export const useCheckout = (): CheckoutState => {
  const mutation = useMutation({
    mutationFn: (data: CheckoutRequest) =>
      fetchPost('/api/billing/checkout', CheckoutResponseSchema, data),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.sessionUrl;
    },
  });

  const checkout = async (priceId: string, orgId?: string) => {
    const organizationId = orgId || localStorage.getItem('currentOrgId') || 'default-org';
    await mutation.mutateAsync({ priceId, organizationId });
  };

  return {
    loading: mutation.isPending,
    processingId: mutation.variables?.priceId || null,
    checkout,
  };
};

/**
 * Hook for plan selection checkout (used in PlanTab)
 */
export const usePlanCheckout = () => {
  return useMutation({
    mutationFn: ({ orgId, planId }: { orgId: string; planId: string }) =>
      fetchPost('/api/billing/checkout', CheckoutResponseSchema, { orgId, planId }),
    onSuccess: (data) => {
      // Handle successful checkout creation
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    },
  });
};
