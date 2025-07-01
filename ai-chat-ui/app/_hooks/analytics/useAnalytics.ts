import useSWR from 'swr';
import { fetchGet } from '@/app/_utils/fetcher';

export function useConversationFlow(widgetId: string, dateRange: { start: Date; end: Date }) {
  const params = new URLSearchParams({
    widgetId,
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
  });

  const { data, error } = useSWR(`/api/bff/analytics/conversation-flow?${params}`, fetchGet);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useUnresolvedQuestions(widgetId: string, limit = 50) {
  const { data, error, mutate } = useSWR(
    `/api/bff/analytics/unresolved?widgetId=${widgetId}&limit=${limit}`,
    fetchGet
  );

  return {
    questions: data?.questions || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
