/**
 * 組織ロール列挙
 */
export const Role = ['owner', 'org_admin', 'editor', 'viewer', 'super_admin'] as const;

export type Role = 'owner' | 'org_admin' | 'editor' | 'viewer' | 'super_admin';
