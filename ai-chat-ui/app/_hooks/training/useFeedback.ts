import { useQuery } from '@tanstack/react-query';
import { fetchGet } from '@/_utils/fetcher';

export function useFeedbackStats(widgetId?: string) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['feedback-stats', widgetId],
    queryFn: () =>
      fetchGet(`/api/bff/training/feedback/stats${widgetId ? `?widgetId=${widgetId}` : ''}`),
  });

  return {
    stats: data,
    isLoading,
    isError: !!error,
  };
}

export function useNegativeFeedback(widgetId?: string, limit = 50) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['negative-feedback', widgetId, limit],
    queryFn: () =>
      fetchGet(
        `/api/bff/training/feedback/negative?limit=${limit}${widgetId ? `&widgetId=${widgetId}` : ''}`
      ),
  });

  return {
    feedbacks: data?.feedbacks || [],
    isLoading,
    isError: !!error,
  };
}
