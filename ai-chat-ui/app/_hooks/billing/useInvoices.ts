import { useQuery } from '@tanstack/react-query';
import { fetchGet } from '@/app/_utils/fetcher';
import { InvoicesResponseSchema } from '@/app/_schemas/billing';

// Query keys
const invoiceKeys = {
  all: ['invoices'] as const,
  list: (orgId: string) => [...invoiceKeys.all, 'list', orgId] as const,
};

/**
 * Hook to fetch invoices for an organization
 */
export function useInvoices(orgId: string) {
  return useQuery({
    queryKey: invoiceKeys.list(orgId),
    queryFn: () =>
      fetchGet(`/api/billing/usage?orgId=${orgId}&invoices=1`, InvoicesResponseSchema).then(
        (data) => data.invoices
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!orgId,
  });
}
