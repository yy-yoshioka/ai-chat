import type { Role } from './role';
import type { OrgMembership } from './membership';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin'; // Legacy field for backward compatibility
  roles?: Role[]; // New roles array
  organizationId?: string; // Primary organization (legacy)
  organizationName?: string;
  organizations?: OrgMembership[]; // Multiple organization memberships
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to check if user has a specific role in an organization
export function hasRole(user: User, orgId: string, role: Role): boolean {
  // Check legacy admin role for backward compatibility
  if (
    user.role === 'admin' &&
    user.organizationId === orgId &&
    (role === 'org_admin' || role === 'editor' || role === 'viewer')
  ) {
    return true;
  }

  // Check new role system
  const orgMembership = user.organizations?.find((org) => org.organizationId === orgId);
  return orgMembership?.roles.includes(role) || false;
}

// Helper function to check if user has permission for a resource action in an organization
export function hasPermission(
  user: User,
  orgId: string,
  resource: string,
  action: string
): boolean {
  const orgMembership = user.organizations?.find((org) => org.organizationId === orgId);
  if (!orgMembership) return false;

  return orgMembership.permissions.some(
    (permission) => permission.resource === resource && permission.actions.includes(action)
  );
}
