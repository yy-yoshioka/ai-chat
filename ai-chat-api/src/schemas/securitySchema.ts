import { z } from 'zod';

export const permissionGrantSchema = z.object({
  userId: z.string().cuid(),
  permission: z.enum([
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
  ]),
});

export const securityReportQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const userPermissionsResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  roles: z.array(
    z.enum(['owner', 'org_admin', 'editor', 'viewer', 'api_user', 'read_only'])
  ),
  permissionOverrides: z.array(
    z.object({
      permission: z.string(),
      granted: z.boolean(),
    })
  ),
});

export type PermissionGrant = z.infer<typeof permissionGrantSchema>;
export type SecurityReportQuery = z.infer<typeof securityReportQuerySchema>;
export type UserPermissionsResponse = z.infer<
  typeof userPermissionsResponseSchema
>;
