import useSWR from 'swr';
import { fetcherWithAuth } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import type { WebhookLog, WebhookLogsQuery } from '@/app/_schemas/webhooks';

export function useWebhookLogs(webhookId: string | null, query?: WebhookLogsQuery) {
  const authToken = getAuthTokenFromCookie();

  // Build query string
  const queryString = query
    ? new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  const {
    data: logs,
    error,
    isLoading,
    mutate,
  } = useSWR<WebhookLog[]>(
    authToken && webhookId
      ? `/api/bff/webhooks/${webhookId}/logs${queryString ? `?${queryString}` : ''}`
      : null,
    (url) => fetcherWithAuth(url, authToken!)
  );

  return {
    logs: logs || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
