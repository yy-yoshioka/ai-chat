import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchGet, fetchPost, fetchPut } from '@/app/_utils/fetcher';

// Schemas
const FAQSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
  weight: z.number().optional(),
  isActive: z.boolean().optional(),
});

const FAQListResponseSchema = z.object({
  faqs: z.array(FAQSchema),
});

export type FAQ = z.infer<typeof FAQSchema>;

// Query keys
const faqKeys = {
  all: ['faq'] as const,
  lists: () => [...faqKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...faqKeys.lists(), filters] as const,
  detail: (id: string) => [...faqKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch FAQs
 */
export function useFAQs(params?: { category?: string; active?: boolean }) {
  return useQuery({
    queryKey: faqKeys.list(params),
    queryFn: () => fetchGet('/api/bff/faq', FAQListResponseSchema, { params }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new FAQ
 */
export function useCreateFAQ() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<FAQ, 'id'>) => 
      fetchPost('/api/bff/faq', FAQSchema, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing FAQ
 */
export function useUpdateFAQ() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<FAQ> & { id: string }) => 
      fetchPut(`/api/bff/faq/${id}`, FAQSchema, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(variables.id) });
    },
  });
}