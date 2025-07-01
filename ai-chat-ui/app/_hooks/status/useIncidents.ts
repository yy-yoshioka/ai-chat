'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import { Incident, CreateIncidentInput, UpdateIncidentInput } from '@/app/_schemas/system-health';
import { posterWithAuth } from '@/app/_utils/fetcher';
import { toast } from '@/components/ui/use-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useIncidents = (days: number = 30) => {
  const { data, error, mutate } = useSWR<Incident[]>(
    `/api/bff/status/incidents?days=${days}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const createIncident = useCallback(
    async (input: CreateIncidentInput) => {
      try {
        const response = await fetch('/api/bff/status/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error('Failed to create incident');
        }

        const newIncident = await response.json();
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
        const response = await fetch(`/api/bff/status/incidents/${incidentId}/updates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });

        if (!response.ok) {
          throw new Error('Failed to update incident');
        }

        const updatedIncident = await response.json();
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
