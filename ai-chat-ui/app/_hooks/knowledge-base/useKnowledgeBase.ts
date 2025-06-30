import useSWR from 'swr';
import { fetchGet, fetchDelete } from '@/app/_utils/fetcher';

export function useKnowledgeBase(widgetId: string) {
  const { data, error, mutate } = useSWR(
    `/api/bff/knowledge-base/items?widgetId=${widgetId}`,
    fetchGet
  );

  const deleteItem = async (itemId: string) => {
    await fetchDelete(`/api/bff/knowledge-base/items/${itemId}`);
    await mutate();
  };

  return {
    items: data?.items || [],
    isLoading: !error && !data,
    isError: error,
    deleteItem,
    mutate,
  };
}
