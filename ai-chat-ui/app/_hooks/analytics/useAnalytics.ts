import { useQuery } from '@tanstack/react-query';
import { fetchGet } from '@/app/_utils/fetcher';

export function useConversationFlow(widgetId: string, dateRange: { start: Date; end: Date }) {
  const params = new URLSearchParams({
    widgetId,
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
  });

  const { data, error, isLoading } = useQuery({
    queryKey: ['conversation-flow', widgetId, dateRange],
    queryFn: () => fetchGet(`/api/bff/analytics/conversation-flow?${params}`),
  });

  return {
    data,
    isLoading,
    isError: !!error,
  };
}

export function useUnresolvedQuestions(widgetId: string, limit = 50) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['unresolved-questions', widgetId, limit],
    queryFn: () => fetchGet(`/api/bff/analytics/unresolved?widgetId=${widgetId}&limit=${limit}`),
  });

  return {
    questions: data?.questions || [],
    total: data?.total || 0,
    isLoading,
    isError: !!error,
    mutate: refetch,
  };
}
