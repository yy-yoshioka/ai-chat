'use client';

import React from 'react';
import { useUsers } from '@/app/_hooks/users/useUsers';
import { UsersView } from '@/app/_components/feature/users/UsersView';

export default function AdminUsersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const { users, isLoading, editUser, deleteUser, inviteUser } = useUsers(orgId);

  return (
    <UsersView
      users={users}
      isLoading={isLoading}
      onInviteUser={inviteUser}
      onEditUser={editUser}
      onDeleteUser={deleteUser}
    />
  );
}
