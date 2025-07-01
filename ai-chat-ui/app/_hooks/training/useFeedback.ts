import useSWR from 'swr';
import { fetchGet } from '@/_utils/fetcher';

export function useFeedbackStats(widgetId?: string) {
  const { data, error } = useSWR(
    `/api/bff/training/feedback/stats${widgetId ? `?widgetId=${widgetId}` : ''}`,
    fetchGet
  );

  return {
    stats: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useNegativeFeedback(widgetId?: string, limit = 50) {
  const { data, error } = useSWR(
    `/api/bff/training/feedback/negative?limit=${limit}${widgetId ? `&widgetId=${widgetId}` : ''}`,
    fetchGet
  );

  return {
    feedbacks: data?.feedbacks || [],
    isLoading: !error && !data,
    isError: error,
  };
}
