import type { UserRole, UserStatus } from '@/_schemas/users';

export const USER_CONSTANTS = {
  LOADING_DELAY_MS: 1000,
} as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理者',
  member: 'メンバー',
  guest: 'ゲスト',
} as const;

export const USER_ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800',
  member: 'bg-blue-100 text-blue-800',
  guest: 'bg-gray-100 text-gray-800',
} as const;

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'アクティブ',
  inactive: '非アクティブ',
  pending: '保留中',
} as const;

export const USER_STATUS_STYLES: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
} as const;
