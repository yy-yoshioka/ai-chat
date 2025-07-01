import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SettingsTab } from '@/app/_schemas/settings';
import { fetchGet, fetchPost, fetchDelete, fetchPut } from '@/app/_utils/fetcher';

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
      return fetchGet(`/api/bff/settings/api-keys?orgId=${orgId}`);
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      return fetchPost('/api/bff/settings/api-keys', { name, orgId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await fetchDelete(`/api/bff/settings/api-keys/${keyId}`);
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
  };
}

// Hook for Notification Settings
export function useNotificationSettings(orgId: string) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings', orgId],
    queryFn: async () => {
      return fetchGet(`/api/bff/settings/notifications?orgId=${orgId}`);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Record<string, unknown>) => {
      return fetchPut('/api/bff/settings/notifications', { settings: newSettings, orgId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', orgId] });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
  };
}
