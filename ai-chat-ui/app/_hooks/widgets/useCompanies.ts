'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Company } from '@/app/_schemas/widget';
import { fetchGet } from '@/app/_utils/fetcher';

export function useCompanies(orgId: string) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching companies for organization:', orgId);
      const data = await fetchGet<Company[]>(`/api/organizations/${orgId}/companies`, {
        credentials: 'include',
      });

      console.log('Companies fetched:', data);
      setCompanies(data);

      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, selectedCompanyId]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    isLoading,
    fetchCompanies,
  };
}
