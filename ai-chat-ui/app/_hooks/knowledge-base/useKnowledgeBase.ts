import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGet, fetchDelete } from '@/app/_utils/fetcher';

export function useKnowledgeBase(widgetId: string) {
  const queryClient = useQueryClient();
  
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['knowledge-base', widgetId],
    queryFn: () => fetchGet(`/api/bff/knowledge-base/items?widgetId=${widgetId}`),
    enabled: !!widgetId,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => fetchDelete(`/api/bff/knowledge-base/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', widgetId] });
    },
  });

  return {
    items: data?.items || [],
    isLoading,
    isError: !!error,
    deleteItem: deleteItemMutation.mutateAsync,
    mutate: refetch,
  };
}
