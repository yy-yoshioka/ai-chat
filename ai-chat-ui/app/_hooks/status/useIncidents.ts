'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Incident, CreateIncidentInput, UpdateIncidentInput } from '@/app/_schemas/system-health';
import { toast } from '@/components/ui/use-toast';
import { fetchGet, fetchPost, fetcher } from '@/app/_utils/fetcher';

export const useIncidents = (days: number = 30) => {
  const queryClient = useQueryClient();
  
  const { data, error, isLoading, refetch } = useQuery<Incident[]>({
    queryKey: ['incidents', days],
    queryFn: () => fetchGet(`/api/bff/status/incidents?days=${days}`),
    refetchInterval: 60000, // Refresh every minute
  });

  const createIncidentMutation = useMutation({
    mutationFn: (input: CreateIncidentInput) => fetchPost('/api/bff/status/incidents', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast({ title: 'Incident created successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create incident',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const updateIncidentMutation = useMutation({
    mutationFn: ({ incidentId, update }: { incidentId: string; update: UpdateIncidentInput }) =>
      fetchPost(`/api/bff/status/incidents/${incidentId}/updates`, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast({ title: 'Incident updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update incident',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    incidents: data || [],
    isLoading,
    isError: !!error,
    createIncident: createIncidentMutation.mutateAsync,
    updateIncident: (incidentId: string, update: UpdateIncidentInput) =>
      updateIncidentMutation.mutateAsync({ incidentId, update }),
    refresh: refetch,
  };
};

export const useIncident = (incidentId: string) => {
  const { data, error, isLoading, refetch } = useQuery<Incident>({
    queryKey: ['incident', incidentId],
    queryFn: () => fetcher(`/api/bff/status/incidents/${incidentId}`),
    enabled: !!incidentId,
  });

  return {
    incident: data,
    isLoading,
    isError: !!error,
    refresh: refetch,
  };
};
