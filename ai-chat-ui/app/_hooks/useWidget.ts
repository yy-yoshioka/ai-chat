import { useState, useEffect, useCallback } from 'react';
import { WidgetDetail, WidgetAnalytics } from '@/app/_schemas/widgets';
import { fetcherWithAuth } from '@/app/_utils/fetcher';

export function useWidget(widgetId: string) {
  const [widget, setWidget] = useState<WidgetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWidget = useCallback(async () => {
    if (!widgetId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetcherWithAuth(`/api/bff/widgets/${widgetId}`);
      setWidget(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch widget'));
    } finally {
      setLoading(false);
    }
  }, [widgetId]);

  useEffect(() => {
    fetchWidget();
  }, [fetchWidget]);

  return {
    widget,
    loading,
    error,
    refetch: fetchWidget,
  };
}

export function useWidgetAnalytics(widgetId: string) {
  const [analytics, setAnalytics] = useState<WidgetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!widgetId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetcherWithAuth(`/api/bff/widgets/${widgetId}/analytics`);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch widget analytics'));
    } finally {
      setLoading(false);
    }
  }, [widgetId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
