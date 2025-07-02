import { Permission } from '../../_schemas/security';

export interface NavItem {
  title: string;
  path: string;
  icon: string; // Emoji / HeroIcon 名など
  permission?: Permission;
}

export const ADMIN_SIDEBAR: NavItem[] = [
  { title: 'ダッシュボード', path: '/admin/dashboard', icon: '📊' },
  { title: 'FAQ管理', path: '/admin/faq', icon: '❓' },
  { title: 'ユーザー管理', path: '/admin/users', icon: '👥' },
  { title: '組織管理', path: '/admin/org', icon: '🏢' },
  { title: 'チャット監視', path: '/admin/chats', icon: '💬' },
  { title: 'システム設定', path: '/admin/settings', icon: '⚙️' },
  { title: 'レポート', path: '/admin/reports', icon: '📈' },
  { title: 'ログ監視', path: '/admin/logs', icon: '📋' },
  { title: 'システムヘルス', path: '/admin/system-health', icon: '🏥' },
  {
    title: 'セキュリティ',
    path: '/admin/[orgId]/security',
    icon: '🔒',
    permission: 'AUDIT_READ' as Permission,
  },
  {
    title: '権限管理',
    path: '/admin/[orgId]/security/permissions',
    icon: '🔑',
    permission: 'ORG_WRITE' as Permission,
  },
] as const;
