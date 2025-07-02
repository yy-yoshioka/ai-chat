'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import { Incident, CreateIncidentInput, UpdateIncidentInput } from '@/app/_schemas/system-health';
import { toast } from '@/components/ui/use-toast';
import { fetchGet, fetchPost, fetchPut } from '@/app/_utils/fetcher';

export const useIncidents = (days: number = 30) => {
  const { data, error, mutate } = useSWR<Incident[]>(
    `/api/bff/status/incidents?days=${days}`,
    fetchGet,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const createIncident = useCallback(
    async (input: CreateIncidentInput) => {
      try {
        const newIncident = await fetchPost('/api/bff/status/incidents', input);
        mutate();
        toast({ title: 'Incident created successfully' });
        return newIncident;
      } catch (error) {
        toast({
          title: 'Failed to create incident',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [mutate]
  );

  const updateIncident = useCallback(
    async (incidentId: string, update: UpdateIncidentInput) => {
      try {
        const updatedIncident = await fetchPost(
          `/api/bff/status/incidents/${incidentId}/updates`,
          update
        );
        mutate();
        toast({ title: 'Incident updated successfully' });
        return updatedIncident;
      } catch (error) {
        toast({
          title: 'Failed to update incident',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [mutate]
  );

  return {
    incidents: data || [],
    isLoading: !error && !data,
    isError: error,
    createIncident,
    updateIncident,
    refresh: mutate,
  };
};

export const useIncident = (incidentId: string) => {
  const { data, error, mutate } = useSWR<Incident>(
    incidentId ? `/api/bff/status/incidents/${incidentId}` : null,
    fetcher
  );

  return {
    incident: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};
