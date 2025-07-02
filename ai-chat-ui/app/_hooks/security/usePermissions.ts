'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchGet } from '@/app/_utils/fetcher';
import { useSession } from 'next-auth/react';
import { Permission } from '@/app/_schemas/security';

export const usePermissions = () => {
  const { data: session } = useSession();

  const { data: permissions = [], isLoading } = useQuery<{ permissions: Permission[] }>({
    queryKey: ['permissions', session?.user?.id],
    queryFn: () => fetchGet(`/api/bff/security/users/${session?.user?.id}/permissions`),
    enabled: !!session?.user?.id,
  });

  const hasPermission = (permission: Permission): boolean => {
    return permissions.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissionList: Permission[]): boolean => {
    return permissionList.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissionList: Permission[]): boolean => {
    return permissionList.every((p) => hasPermission(p));
  };

  return {
    permissions: permissions.permissions || [],
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
