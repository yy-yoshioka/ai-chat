'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Company } from '@/app/_schemas/widget';

export function useCompanies(orgId: string) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching companies for organization:', orgId);
      const response = await fetch(`/api/organizations/${orgId}/companies`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Companies fetched:', data);
        setCompanies(data);
        
        if (data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
        }
      } else {
        console.error('Failed to fetch companies:', response.status);
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