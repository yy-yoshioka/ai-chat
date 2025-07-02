import { z } from 'zod';

export const PermissionSchema = z.enum([
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
  'SYSTEM_ADMIN',
  'AUDIT_READ',
]);

export const RoleSchema = z.enum([
  'owner',
  'org_admin',
  'editor',
  'viewer',
  'api_user',
  'read_only',
]);

export const SecurityAuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  resource: z.string().optional(),
  success: z.boolean(),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  createdAt: z.string(),
});

export const UserPermissionSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  roles: z.array(RoleSchema),
  permissions: z.array(PermissionSchema),
  permissionOverrides: z.array(
    z.object({
      permission: PermissionSchema,
      granted: z.boolean(),
    })
  ),
});

export const SecurityReportSchema = z.object({
  summary: z.object({
    totalEvents: z.number(),
    failedEvents: z.number(),
    highRiskEvents: z.number(),
    successRate: z.string(),
  }),
  topActions: z.array(
    z.object({
      action: z.string(),
      count: z.number(),
    })
  ),
  topUsers: z.array(
    z.object({
      userId: z.string().nullable(),
      _count: z.object({
        userId: z.number(),
      }),
    })
  ),
  dataAccess: z.array(
    z.object({
      table: z.string(),
      operation: z.string(),
      count: z.number(),
    })
  ),
});

export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type SecurityAuditLog = z.infer<typeof SecurityAuditLogSchema>;
export type UserPermission = z.infer<typeof UserPermissionSchema>;
export type SecurityReport = z.infer<typeof SecurityReportSchema>;
