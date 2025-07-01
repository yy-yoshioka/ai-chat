import React from 'react';
import type { UserRole, UserStatus } from '@/app/_schemas/users';
import {
  USER_ROLE_LABELS,
  USER_ROLE_STYLES,
  USER_STATUS_LABELS,
  USER_STATUS_STYLES,
} from '@/app/_config/users/constants';

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${USER_ROLE_STYLES[role]}`}
    >
      {USER_ROLE_LABELS[role]}
    </span>
  );
}

interface StatusBadgeProps {
  status: UserStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${USER_STATUS_STYLES[status]}`}
    >
      {USER_STATUS_LABELS[status]}
    </span>
  );
}
