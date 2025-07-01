'use client';

import useSWR from 'swr';
import { PublicStatus } from '@/app/_schemas/system-health';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useStatus = () => {
  const { data, error, mutate } = useSWR<PublicStatus>('/api/bff/status', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  return {
    status: data?.status,
    incidents: data?.incidents || [],
    sla: data?.sla,
    lastUpdated: data?.lastUpdated,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};
