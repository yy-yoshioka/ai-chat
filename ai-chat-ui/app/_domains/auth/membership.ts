import type { Role } from './role';
import type { Permission } from './permission';

/**
 * ユーザーが所属する 1 組織分のメンバーシップ情報
 */
export interface OrgMembership {
  organizationId: string;
  organizationName?: string;
  roles: Role[];
  permissions: Permission[];
  /** ISO 文字列 */
  joinedAt: string;
}
