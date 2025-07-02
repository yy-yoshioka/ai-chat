import { prisma } from '../lib/prisma';
import { Role, Permission } from '@prisma/client';

// Default role permissions mapping
const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'ORG_READ',
    'ORG_WRITE',
    'ORG_DELETE',
    'ORG_INVITE_USERS',
    'WIDGET_READ',
    'WIDGET_WRITE',
    'WIDGET_DELETE',
    'WIDGET_CONFIGURE',
    'CHAT_READ',
    'CHAT_MODERATE',
    'CHAT_EXPORT',
    'KB_READ',
    'KB_WRITE',
    'KB_DELETE',
    'KB_TRAIN',
    'ANALYTICS_READ',
    'ANALYTICS_EXPORT',
    'SETTINGS_READ',
    'SETTINGS_WRITE',
    'BILLING_READ',
    'BILLING_WRITE',
  ] as Permission[],

  org_admin: [
    'ORG_READ',
    'ORG_WRITE',
    'ORG_INVITE_USERS',
    'WIDGET_READ',
    'WIDGET_WRITE',
    'WIDGET_DELETE',
    'WIDGET_CONFIGURE',
    'CHAT_READ',
    'CHAT_MODERATE',
    'CHAT_EXPORT',
    'KB_READ',
    'KB_WRITE',
    'KB_DELETE',
    'KB_TRAIN',
    'ANALYTICS_READ',
    'ANALYTICS_EXPORT',
    'SETTINGS_READ',
    'SETTINGS_WRITE',
  ] as Permission[],

  editor: [
    'ORG_READ',
    'WIDGET_READ',
    'WIDGET_WRITE',
    'WIDGET_CONFIGURE',
    'CHAT_READ',
    'CHAT_MODERATE',
    'KB_READ',
    'KB_WRITE',
    'KB_TRAIN',
    'ANALYTICS_READ',
    'SETTINGS_READ',
  ] as Permission[],

  viewer: [
    'ORG_READ',
    'WIDGET_READ',
    'CHAT_READ',
    'KB_READ',
    'ANALYTICS_READ',
    'SETTINGS_READ',
  ] as Permission[],

  api_user: [
    'WIDGET_READ',
    'WIDGET_CONFIGURE',
    'CHAT_READ',
    'KB_READ',
  ] as Permission[],

  read_only: [
    'ORG_READ',
    'WIDGET_READ',
    'CHAT_READ',
    'KB_READ',
    'ANALYTICS_READ',
  ] as Permission[],
};

export const initializeRolePermissions = async () => {
  for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: role as Role,
            permission: permission as Permission,
          },
        },
        update: {},
        create: {
          role: role as Role,
          permission: permission as Permission,
        },
      });
    }
  }
};

export const getUserPermissions = async (
  userId: string,
  organizationId: string
): Promise<Permission[]> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      permissionOverrides: {
        where: { organizationId },
      },
    },
  });

  if (!user) {
    return [];
  }

  // Get base permissions from roles
  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role: {
        in: user.roles,
      },
    },
    select: { permission: true },
  });

  let permissions = new Set(rolePermissions.map((rp) => rp.permission));

  // Apply permission overrides
  for (const override of user.permissionOverrides) {
    if (override.granted) {
      permissions.add(override.permission);
    } else {
      permissions.delete(override.permission);
    }
  }

  return Array.from(permissions);
};

export const hasPermission = async (
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId, organizationId);
  return permissions.includes(permission);
};

export const hasAnyPermission = async (
  userId: string,
  organizationId: string,
  permissions: Permission[]
): Promise<boolean> => {
  const userPermissions = await getUserPermissions(userId, organizationId);
  return permissions.some((p) => userPermissions.includes(p));
};

export const grantPermission = async (
  userId: string,
  organizationId: string,
  permission: Permission,
  grantedBy: string
) => {
  return prisma.userPermissionOverride.upsert({
    where: {
      userId_organizationId_permission: {
        userId,
        organizationId,
        permission,
      },
    },
    update: {
      granted: true,
      createdBy: grantedBy,
    },
    create: {
      userId,
      organizationId,
      permission,
      granted: true,
      createdBy: grantedBy,
    },
  });
};

export const revokePermission = async (
  userId: string,
  organizationId: string,
  permission: Permission,
  revokedBy: string
) => {
  return prisma.userPermissionOverride.upsert({
    where: {
      userId_organizationId_permission: {
        userId,
        organizationId,
        permission,
      },
    },
    update: {
      granted: false,
      createdBy: revokedBy,
    },
    create: {
      userId,
      organizationId,
      permission,
      granted: false,
      createdBy: revokedBy,
    },
  });
};

export const getOrganizationUsers = async (organizationId: string) => {
  return prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      email: true,
      name: true,
      roles: true,
      permissionOverrides: {
        where: { organizationId },
        select: {
          permission: true,
          granted: true,
        },
      },
    },
  });
};
