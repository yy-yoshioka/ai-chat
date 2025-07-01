'use client';

import { useState, useCallback } from 'react';
import { fetchGet } from '@/_utils/fetcher';

interface FeedbackStats {
  total: number;
  helpful: number;
  unhelpful: number;
  satisfactionRate: number;
}

interface NegativeFeedback {
  id: string;
  chatLogId: string;
  feedback: string;
  userId: string;
  createdAt: string;
  chatLog: {
    question: string;
    answer: string;
    widget: {
      id: string;
      name: string;
    };
  };
}

export function useFeedbackStats(widgetId?: string) {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = `/api/bff/training/feedback/stats${widgetId ? `?widgetId=${widgetId}` : ''}`;
      const data = await fetchGet<FeedbackStats>(url);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feedback stats');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
}

export function useNegativeFeedback(widgetId?: string, limit = 50) {
  const [feedbacks, setFeedbacks] = useState<NegativeFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNegativeFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: limit.toString() });
      if (widgetId) params.append('widgetId', widgetId);
      
      const url = `/api/bff/training/feedback/negative?${params.toString()}`;
      const data = await fetchGet<{ feedbacks: NegativeFeedback[] }>(url);
      setFeedbacks(data.feedbacks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch negative feedback');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, limit]);

  return {
    feedbacks,
    isLoading,
    error,
    fetchNegativeFeedback,
  };
}