import { useState, useEffect, useCallback } from 'react';
import { WidgetListResponse, WidgetCreate, WidgetUpdate } from '@/app/_schemas/widgets';
import {
  fetcherWithAuth,
  posterWithAuth,
  updaterWithAuth,
  deleterWithAuth,
} from '@/app/_utils/fetcher';

interface UseWidgetsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
}

export function useWidgets(options: UseWidgetsOptions = {}) {
  const [data, setData] = useState<WidgetListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.search) params.append('search', options.search);
      if (options.status) params.append('status', options.status);

      const url = `/api/bff/widgets${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetcherWithAuth(url);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch widgets'));
    } finally {
      setLoading(false);
    }
  }, [options.page, options.limit, options.search, options.status]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const createWidget = async (widget: WidgetCreate) => {
    try {
      const newWidget = await posterWithAuth('/api/bff/widgets', widget);
      await fetchWidgets(); // Refresh the list
      return newWidget;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create widget');
    }
  };

  const updateWidget = async (id: string, updates: WidgetUpdate) => {
    try {
      const updatedWidget = await updaterWithAuth(`/api/bff/widgets/${id}`, updates);
      await fetchWidgets(); // Refresh the list
      return updatedWidget;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update widget');
    }
  };

  const deleteWidget = async (id: string) => {
    try {
      await deleterWithAuth(`/api/bff/widgets/${id}`);
      await fetchWidgets(); // Refresh the list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete widget');
    }
  };

  return {
    widgets: data?.widgets || [],
    pagination: data?.pagination || null,
    loading,
    error,
    refetch: fetchWidgets,
    createWidget,
    updateWidget,
    deleteWidget,
  };
}
