'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGet, fetchPost, fetchPut } from '@/app/_utils/fetcher';

export interface RetentionPolicy {
  id: string;
  chatLogs: number;
  messageFeedback: number;
  systemMetrics: number;
  webhookLogs: number;
  healthChecks: number;
  auditLogs: number;
  autoDelete: boolean;
  anonymizeData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RetentionJob {
  id: string;
  organizationId?: string;
  organization?: { name: string };
  jobType: string;
  status: string;
  itemsProcessed: number;
  itemsDeleted: number;
  itemsAnonymized: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export const useDataRetention = (orgId: string) => {
  const queryClient = useQueryClient();

  // Fetch retention policy
  const { data: policy, isLoading: isPolicyLoading } = useQuery<RetentionPolicy>({
    queryKey: ['data-retention-policy', orgId],
    queryFn: () => fetchGet('/api/bff/data-retention/policy'),
  });

  // Fetch retention jobs
  const { data: jobs = [], isLoading: isJobsLoading } = useQuery<RetentionJob[]>({
    queryKey: ['data-retention-jobs', orgId],
    queryFn: () => fetchGet('/api/bff/data-retention/jobs'),
  });

  // Update retention policy
  const updatePolicyMutation = useMutation({
    mutationFn: (newPolicy: Partial<RetentionPolicy>) =>
      fetchPut('/api/bff/data-retention/policy', newPolicy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-retention-policy', orgId] });
    },
  });

  // Trigger manual cleanup
  const triggerCleanupMutation = useMutation({
    mutationFn: (dataType: string) => fetchPost('/api/bff/data-retention/cleanup', { dataType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-retention-jobs', orgId] });
    },
  });

  return {
    policy,
    jobs,
    isLoading: isPolicyLoading || isJobsLoading,
    updatePolicy: updatePolicyMutation.mutateAsync,
    triggerCleanup: triggerCleanupMutation.mutateAsync,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['data-retention-policy', orgId] });
      queryClient.invalidateQueries({ queryKey: ['data-retention-jobs', orgId] });
    },
  };
};
