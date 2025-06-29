import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthResponseSchema, LoginResponseSchema, LogoutResponseSchema } from '../../_schemas/auth';
import { Role } from '../../_domains/auth';
import { hasPermission, hasRole } from '../../_utils/auth-utils';
import { fetchGet, fetchPost } from '../../_utils/fetcher';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Auth query keys
const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Hook to get current authenticated user
 */
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => fetchGet('/api/bff/auth/me', AuthResponseSchema),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401
  });
}

/**
 * Main auth hook that provides authentication functionality
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useUser();

  const user = data?.user || null;
  const authenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Check if user has specific role in organization
  const hasOrgPermission = useCallback(
    (orgId: string, role: Role): boolean => {
      if (!user) return false;
      return hasRole(user, orgId, role);
    },
    [user]
  );

  // Check if user has specific resource permission in organization
  const hasOrgResourcePermission = useCallback(
    (orgId: string, resource: string, action: string): boolean => {
      if (!user) return false;
      return hasPermission(user, orgId, resource, action);
    },
    [user]
  );

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      fetchPost('/api/bff/auth/login', LoginResponseSchema, credentials),
    onSuccess: () => {
      // Refetch user data after successful login
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => fetchPost('/api/bff/auth/logout', LogoutResponseSchema),
    onSuccess: () => {
      // Clear user data and redirect
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      router.push('/login');
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name?: string }) =>
      fetchPost('/api/bff/auth/signup', LoginResponseSchema, data),
    onSuccess: () => {
      // Refetch user data after successful signup
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });

  // Wrapper functions for backward compatibility
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        await loginMutation.mutateAsync({ email, password });
        return true;
      } catch {
        return false;
      }
    },
    [loginMutation]
  );

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      await logoutMutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  }, [logoutMutation]);

  const signup = useCallback(
    async (email: string, password: string, name?: string): Promise<boolean> => {
      try {
        await signupMutation.mutateAsync({ email, password, name });
        return true;
      } catch {
        return false;
      }
    },
    [signupMutation]
  );

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.user() });
  }, [queryClient]);

  return {
    // State
    user,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    authenticated,
    isAdmin,

    // Methods
    login,
    logout,
    signup,
    refreshUser,
    hasOrgPermission,
    hasOrgResourcePermission,
  };
}
