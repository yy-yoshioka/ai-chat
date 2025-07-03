import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { Permission, Role } from '@prisma/client';

// Map roles to their permissions
const rolePermissions: Record<Role, Permission[]> = {
  [Role.owner]: [
    // All permissions
    Permission.ORG_READ,
    Permission.ORG_WRITE,
    Permission.ORG_DELETE,
    Permission.ORG_INVITE_USERS,
    Permission.WIDGET_READ,
    Permission.WIDGET_WRITE,
    Permission.WIDGET_DELETE,
    Permission.WIDGET_CONFIGURE,
    Permission.CHAT_READ,
    Permission.CHAT_MODERATE,
    Permission.CHAT_EXPORT,
    Permission.KB_READ,
    Permission.KB_WRITE,
    Permission.KB_DELETE,
    Permission.KB_TRAIN,
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_WRITE,
    Permission.BILLING_READ,
    Permission.BILLING_WRITE,
    Permission.SYSTEM_ADMIN,
    Permission.AUDIT_READ,
  ],
  [Role.org_admin]: [
    // Organization management except delete
    Permission.ORG_READ,
    Permission.ORG_WRITE,
    Permission.ORG_INVITE_USERS,
    Permission.WIDGET_READ,
    Permission.WIDGET_WRITE,
    Permission.WIDGET_DELETE,
    Permission.WIDGET_CONFIGURE,
    Permission.CHAT_READ,
    Permission.CHAT_MODERATE,
    Permission.CHAT_EXPORT,
    Permission.KB_READ,
    Permission.KB_WRITE,
    Permission.KB_DELETE,
    Permission.KB_TRAIN,
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_WRITE,
    Permission.BILLING_READ,
    Permission.AUDIT_READ,
  ],
  [Role.editor]: [
    // Can edit content but not settings
    Permission.ORG_READ,
    Permission.WIDGET_READ,
    Permission.WIDGET_WRITE,
    Permission.WIDGET_CONFIGURE,
    Permission.CHAT_READ,
    Permission.CHAT_MODERATE,
    Permission.KB_READ,
    Permission.KB_WRITE,
    Permission.KB_TRAIN,
    Permission.ANALYTICS_READ,
    Permission.SETTINGS_READ,
  ],
  [Role.viewer]: [
    // Read only access
    Permission.ORG_READ,
    Permission.WIDGET_READ,
    Permission.CHAT_READ,
    Permission.KB_READ,
    Permission.ANALYTICS_READ,
    Permission.SETTINGS_READ,
  ],
  [Role.api_user]: [
    // API specific permissions
    Permission.WIDGET_READ,
    Permission.CHAT_READ,
    Permission.KB_READ,
    Permission.ANALYTICS_READ,
  ],
  [Role.read_only]: [
    // Minimal read permissions
    Permission.ORG_READ,
    Permission.WIDGET_READ,
    Permission.CHAT_READ,
  ],
};

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> {
  // Get user with roles
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
    include: {
      permissionOverrides: {
        where: {
          organizationId,
          permission,
        },
      },
    },
  });

  if (!user) {
    return false;
  }

  // Check permission overrides first
  const override = user.permissionOverrides[0];
  if (override) {
    return override.granted;
  }

  // Check role-based permissions
  for (const role of user.roles) {
    const permissions = rolePermissions[role];
    if (permissions && permissions.includes(permission)) {
      return true;
    }
  }

  return false;
}

/**
 * Middleware to require a specific permission
 */
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hasAccess = await hasPermission(userId, organizationId, permission);

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: permission,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to require any of the specified permissions
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      for (const permission of permissions) {
        const hasAccess = await hasPermission(
          userId,
          organizationId,
          permission
        );
        if (hasAccess) {
          next();
          return;
        }
      }

      res.status(403).json({
        error: 'Insufficient permissions',
        required: permissions,
      });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to require all of the specified permissions
 */
export function requireAllPermissions(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      for (const permission of permissions) {
        const hasAccess = await hasPermission(
          userId,
          organizationId,
          permission
        );
        if (!hasAccess) {
          res.status(403).json({
            error: 'Insufficient permissions',
            required: permissions,
            missing: permission,
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<Permission[]> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
    include: {
      permissionOverrides: {
        where: { organizationId },
      },
    },
  });

  if (!user) {
    return [];
  }

  const permissions = new Set<Permission>();

  // Add role-based permissions
  for (const role of user.roles) {
    const rolePerms = rolePermissions[role];
    if (rolePerms) {
      rolePerms.forEach((perm) => permissions.add(perm));
    }
  }

  // Apply permission overrides
  for (const override of user.permissionOverrides) {
    if (override.granted) {
      permissions.add(override.permission);
    } else {
      permissions.delete(override.permission);
    }
  }

  return Array.from(permissions);
}
