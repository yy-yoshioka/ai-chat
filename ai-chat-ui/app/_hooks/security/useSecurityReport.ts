'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchGet } from '@/app/_utils/fetcher';
import { SecurityReport } from '@/app/_schemas/security';

export const useSecurityReport = (startDate: string, endDate: string, orgId: string) => {
  const { data, isLoading, error } = useQuery<SecurityReport>({
    queryKey: ['security-report', orgId, startDate, endDate],
    queryFn: () => fetchGet(`/api/bff/security/report?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!orgId && !!startDate && !!endDate,
  });

  return {
    report: data,
    isLoading,
    error,
  };
};
