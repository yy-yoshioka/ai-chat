'use client';

import { useQuery } from '@tanstack/react-query';
import { PublicStatus } from '@/app/_schemas/system-health';
import { fetchGet } from '@/app/_utils/fetcher';

export const useStatus = () => {
  const { data, error, isLoading, refetch } = useQuery<PublicStatus>({
    queryKey: ['status'],
    queryFn: () => fetchGet('/api/bff/status'),
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    status: data?.status,
    incidents: data?.incidents || [],
    sla: data?.sla,
    lastUpdated: data?.lastUpdated,
    isLoading,
    isError: !!error,
    refresh: refetch,
  };
};
