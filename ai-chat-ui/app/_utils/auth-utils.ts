import { Role } from '../_domains/auth';
import { User } from '../_schemas';

/**
 * 指定組織でユーザーがロールを持つか判定
 */
export function hasRole(user: User, orgId: string, role: Role): boolean {
  // legacy ('admin' は org_admin 相当)
  if (
    user.role === 'admin' &&
    user.organizationId === orgId &&
    ['org_admin', 'editor', 'viewer'].includes(role)
  ) {
    return true;
  }

  const org = user.organizations?.find((o) => o.organizationId === orgId);
  return !!org?.roles.includes(role);
}

/**
 * 指定組織でユーザーがリソース権限を持つか判定
 */
export function hasPermission(
  user: User,
  orgId: string,
  resource: string,
  action: string
): boolean {
  const org = user.organizations?.find((o) => o.organizationId === orgId);
  return !!org?.permissions.some((p) => p.resource === resource && p.actions.includes(action));
}
