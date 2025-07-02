import { useQuery } from '@tanstack/react-query';
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
    refetch,
  } = useQuery<WebhookLog[]>({
    queryKey: ['webhook-logs', webhookId, query],
    queryFn: () =>
      fetcherWithAuth(
        `/api/bff/webhooks/${webhookId}/logs${queryString ? `?${queryString}` : ''}`,
        authToken!
      ),
    enabled: !!authToken && !!webhookId,
  });

  return {
    logs: logs || [],
    isLoading,
    error,
    refetch,
  };
}
