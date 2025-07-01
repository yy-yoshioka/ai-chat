import { useState, useEffect, useCallback } from 'react';
import { OrganizationStats } from '@/app/_schemas/organizations';
import { fetcherWithAuth } from '@/app/_utils/fetcher';

export function useOrganizationStats(organizationId: string) {
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetcherWithAuth(`/api/bff/organizations/${organizationId}/stats`);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch organization stats'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
