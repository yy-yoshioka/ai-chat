import { z } from 'zod';

// Notification types
export const notificationTypeEnum = z.enum([
  'system',
  'chat_response',
  'user_feedback',
  'widget_status',
  'billing_alert',
  'security_alert',
  'performance_warning',
  'integration_update',
]);

// Notification priority
export const notificationPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

// Notification status
export const notificationStatusEnum = z.enum(['unread', 'read', 'archived']);

// Base notification schema
export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeEnum,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  priority: notificationPriorityEnum.default('medium'),
  status: notificationStatusEnum.default('unread'),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
  actionUrl: z.string().url().optional(),
  actionLabel: z.string().optional(),
  organizationId: z.string(),
  userId: z.string().optional(),
  widgetId: z.string().optional(),
});

// Create notification request
export const createNotificationSchema = z.object({
  type: notificationTypeEnum,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  priority: notificationPriorityEnum.optional(),
  metadata: z.record(z.unknown()).optional(),
  actionUrl: z.string().url().optional(),
  actionLabel: z.string().optional(),
  userId: z.string().optional(),
  widgetId: z.string().optional(),
});

// Update notification request
export const updateNotificationSchema = z.object({
  status: notificationStatusEnum.optional(),
  readAt: z.string().datetime().optional(),
});

// Notification settings
export const notificationSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean().default(true),
    frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).default('immediate'),
    types: z.array(notificationTypeEnum).default([]),
  }),
  inApp: z.object({
    enabled: z.boolean().default(true),
    playSound: z.boolean().default(false),
    showDesktopNotification: z.boolean().default(false),
    types: z.array(notificationTypeEnum).default([]),
  }),
  slack: z.object({
    enabled: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    channel: z.string().optional(),
    types: z.array(notificationTypeEnum).default([]),
  }),
  webhook: z.object({
    enabled: z.boolean().default(false),
    url: z.string().url().optional(),
    secret: z.string().optional(),
    types: z.array(notificationTypeEnum).default([]),
  }),
});

// Notification query parameters
export const notificationQuerySchema = z.object({
  status: notificationStatusEnum.optional(),
  type: notificationTypeEnum.optional(),
  priority: notificationPriorityEnum.optional(),
  widgetId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'priority', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Notifications response
export const notificationsResponseSchema = z.object({
  notifications: z.array(notificationSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
  summary: z.object({
    unreadCount: z.number().int().nonnegative(),
    totalCount: z.number().int().nonnegative(),
    urgentCount: z.number().int().nonnegative(),
  }),
});

// Bulk operations
export const bulkNotificationOperationSchema = z.object({
  notificationIds: z.array(z.string()).min(1).max(100),
  operation: z.enum(['mark_read', 'mark_unread', 'archive', 'delete']),
});

// Notification preferences
export const notificationPreferencesSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  settings: notificationSettingsSchema,
  mutedWidgets: z.array(z.string()).default([]),
  mutedTypes: z.array(notificationTypeEnum).default([]),
  quietHours: z
    .object({
      enabled: z.boolean().default(false),
      start: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      end: z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
      timezone: z.string().default('UTC'),
    })
    .optional(),
});

// Type exports
export type NotificationType = z.infer<typeof notificationTypeEnum>;
export type NotificationPriority = z.infer<typeof notificationPriorityEnum>;
export type NotificationStatus = z.infer<typeof notificationStatusEnum>;
export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
export type BulkNotificationOperation = z.infer<typeof bulkNotificationOperationSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
