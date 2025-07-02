'use client';

import { useQuery } from '@tanstack/react-query';
import { SystemMetric } from '@/app/_schemas/system-health';
import { fetcherWithAuth, fetchGet } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';

interface MetricsQuery {
  service?: string;
  metricType?: string;
  startDate?: Date;
  endDate?: Date;
}

export const useMetrics = (query: MetricsQuery = {}) => {
  const authToken = getAuthTokenFromCookie();

  // Build query string
  const params = new URLSearchParams();
  if (query.service) params.append('service', query.service);
  if (query.metricType) params.append('metricType', query.metricType);
  if (query.startDate) params.append('startDate', query.startDate.toISOString());
  if (query.endDate) params.append('endDate', query.endDate.toISOString());

  const queryString = params.toString();
  const url = `/api/bff/status/metrics${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, refetch } = useQuery<SystemMetric[]>({
    queryKey: ['metrics', query],
    queryFn: () => fetcherWithAuth(url, authToken!),
    enabled: !!authToken,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process metrics for charting
  const processedMetrics = data ? processMetricsForChart(data) : null;

  return {
    metrics: data || [],
    processedMetrics,
    isLoading,
    isError: !!error,
    refresh: refetch,
  };
};

function processMetricsForChart(metrics: SystemMetric[]) {
  // Group metrics by service and type
  const grouped = metrics.reduce(
    (acc, metric) => {
      const key = `${metric.service}-${metric.metricType}`;
      if (!acc[key]) {
        acc[key] = {
          service: metric.service,
          metricType: metric.metricType,
          unit: metric.unit,
          data: [],
        };
      }
      acc[key].data.push({
        timestamp: metric.timestamp,
        value: metric.value,
      });
      return acc;
    },
    {} as Record<
      string,
      {
        service: string;
        metricType: string;
        unit: string;
        data: Array<{ timestamp: string; value: number }>;
      }
    >
  );

  // Sort data points by timestamp
  Object.values(grouped).forEach((group) => {
    group.data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  });

  return grouped;
}

export const useHealthCheck = () => {
  const { data, error, isLoading } = useQuery<{ status: string; timestamp: string }>({
    queryKey: ['health-check'],
    queryFn: () => fetchGet('/api/bff/status/health'),
    refetchInterval: 10000, // Check every 10 seconds
    refetchOnWindowFocus: false,
  });

  return {
    health: data,
    isHealthy: data?.status === 'healthy',
    isDegraded: data?.status === 'degraded',
    isUnhealthy: data?.status === 'unhealthy',
    isLoading,
    isError: !!error,
  };
};
