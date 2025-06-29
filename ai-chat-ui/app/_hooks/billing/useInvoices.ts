import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchGet } from '@/app/_utils/fetcher';

// Invoice schema
const InvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  amount: z.number(),
  status: z.enum(['paid', 'pending', 'overdue']),
  invoiceDate: z.string(),
  dueDate: z.string(),
  pdfUrl: z.string().optional(),
});

const InvoicesResponseSchema = z.object({
  invoices: z.array(InvoiceSchema),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

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
      fetchGet(`/api/billing/usage?orgId=${orgId}&invoices=1`, InvoicesResponseSchema)
        .then(data => data.invoices),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!orgId,
  });
}