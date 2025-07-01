import React from 'react';
import type { User } from '@/app/_schemas/users';
import { UserTable } from './UserTable';

interface UsersViewProps {
  users: User[];
  isLoading: boolean;
  onInviteUser: () => void;
  onEditUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export function UsersView({
  users,
  isLoading,
  onInviteUser,
  onEditUser,
  onDeleteUser,
}: UsersViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <button
          onClick={onInviteUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新しいユーザーを招待
        </button>
      </div>

      <UserTable users={users} onEditUser={onEditUser} onDeleteUser={onDeleteUser} />
    </div>
  );
}
