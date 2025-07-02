'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGet, fetchPost, fetchDelete } from '@/app/_utils/fetcher';
import { UserPermission, Permission } from '@/app/_schemas/security';

export const useUserPermissions = (orgId: string) => {
  const queryClient = useQueryClient();

  // Fetch organization users with permissions
  const { data: users = [], isLoading } = useQuery<UserPermission[]>({
    queryKey: ['organization-users', orgId],
    queryFn: () => fetchGet('/api/bff/security/users'),
    enabled: !!orgId,
  });

  // Grant permission mutation
  const grantPermissionMutation = useMutation({
    mutationFn: ({ userId, permission }: { userId: string; permission: Permission }) =>
      fetchPost(`/api/bff/security/users/${userId}/permissions`, { permission }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-users', orgId] });
    },
  });

  // Revoke permission mutation
  const revokePermissionMutation = useMutation({
    mutationFn: ({ userId, permission }: { userId: string; permission: Permission }) =>
      fetchDelete(`/api/bff/security/users/${userId}/permissions?permission=${permission}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-users', orgId] });
    },
  });

  return {
    users,
    isLoading,
    grantPermission: grantPermissionMutation.mutateAsync,
    revokePermission: revokePermissionMutation.mutateAsync,
    isGranting: grantPermissionMutation.isPending,
    isRevoking: revokePermissionMutation.isPending,
  };
};
