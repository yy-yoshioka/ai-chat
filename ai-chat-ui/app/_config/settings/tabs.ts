import type { TabConfig } from '@/app/_schemas/settings';

export const SETTINGS_TABS: TabConfig[] = [
  { id: 'branding', label: 'ブランディング', icon: '🎨' },
  { id: 'members', label: 'メンバー', icon: '👥' },
  { id: 'widgets', label: 'ウィジェット', icon: '🧩' },
  { id: 'api', label: 'API/Webhooks', icon: '🔑' },
  { id: 'notifications', label: '通知', icon: '🔔' },
  { id: 'security', label: 'セキュリティ', icon: '🔒' },
];

export const DEFAULT_COLORS = {
  primary: '#3B82F6',
  secondary: '#64748B',
} as const;

export const DEFAULT_API_KEY_PREFIX = 'ak_' as const;
export const API_KEY_LENGTH = 16;
