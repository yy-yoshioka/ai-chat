import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/app/_schemas/users';
import { USER_CONSTANTS } from '@/app/_config/users/constants';
import { fetchGet } from '@/app/_utils/fetcher';

const mockUsers: User[] = [
  {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-20T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '山田花子',
    email: 'yamada@example.com',
    role: 'member',
    status: 'active',
    lastLogin: '2024-01-19T15:45:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '3',
    name: '佐藤次郎',
    email: 'sato@example.com',
    role: 'guest',
    status: 'pending',
    createdAt: '2024-01-18T00:00:00Z',
  },
];

export function useUsers(orgId: string) {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', orgId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, USER_CONSTANTS.LOADING_DELAY_MS));
      return mockUsers;
    },
  });

  const editUser = useMutation({
    mutationFn: async (userId: string) => {
      // TODO: Implement user edit
      console.log('Editing user:', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', orgId] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // TODO: Implement user delete
      console.log('Deleting user:', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', orgId] });
    },
  });

  const inviteUser = () => {
    console.log('Inviting new user...');
    // TODO: Implement user invitation
  };

  return {
    users,
    isLoading,
    editUser: editUser.mutate,
    deleteUser: deleteUser.mutate,
    inviteUser,
  };
}

// Hook for individual user data
export function useUser(userId: string) {
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User & { permissions?: string[] }>({
    queryKey: ['user', userId],
    queryFn: () => fetchGet(`/api/bff/users/${userId}`),
    enabled: !!userId,
  });

  return {
    user,
    isLoading,
    isError: !!error,
    mutate: refetch,
  };
}
