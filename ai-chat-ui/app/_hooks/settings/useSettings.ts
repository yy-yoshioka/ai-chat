import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SettingsTab } from '@/app/_schemas/settings';
import { fetchGet, fetchPost, fetchDelete } from '@/app/_utils/fetcher';

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');

  return {
    activeTab,
    setActiveTab,
  };
}

// Hook for API Key management
export function useAPIKeys(orgId: string) {
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys', orgId],
    queryFn: async () => {
      return fetchGet('/api/bff/settings?type=api-keys');
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      return fetchPost('/api/bff/settings?type=api-key', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await fetchDelete(`/api/bff/settings/${keyId}?type=api-key`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] });
    },
  });

  return {
    apiKeys,
    isLoading,
    createKey: createKeyMutation.mutateAsync,
    deleteKey: deleteKeyMutation.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] }),
  };
}

// Hook for Notification Settings
export function useNotificationSettings(orgId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-settings', orgId],
    queryFn: async () => {
      return fetchGet('/api/bff/settings?type=notifications');
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Record<string, unknown>) => {
      return fetchPost('/api/bff/settings?type=notification', newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', orgId] });
    },
  });

  return {
    settings: data?.settings || {},
    isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['notification-settings', orgId] }),
  };
}
