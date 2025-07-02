import { z } from 'zod';

export const settingsTabSchema = z.enum([
  'branding',
  'members',
  'widgets',
  'api',
  'notifications',
  'security',
  'data-retention',
]);

export const brandingSettingsSchema = z.object({
  organizationName: z.string(),
  logoUrl: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
});

export const apiSettingsSchema = z.object({
  apiKey: z.string(),
  webhookUrl: z.string().url().optional(),
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  slackNotifications: z.boolean(),
  slackWebhookUrl: z.string().url().optional(),
});

export const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean(),
  ipRestriction: z.boolean(),
  allowedIps: z.array(z.string()),
});

export const memberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  joinedAt: z.string(),
});

export const tabConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
});

// New schemas for Section-6
export const CreateAPIKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100),
});

export const NotificationSettingsInputSchema = z.record(
  z.string(),
  z.object({
    email: z.boolean().optional(),
    app: z.boolean().optional(),
  })
);

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  data: z.any().optional(),
  createdAt: z.string(),
});

export const APIKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  lastUsed: z.string().nullable(),
  createdAt: z.string(),
});

export type SettingsTab = z.infer<typeof settingsTabSchema>;
export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;
export type ApiSettings = z.infer<typeof apiSettingsSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
export type Member = z.infer<typeof memberSchema>;
export type TabConfig = z.infer<typeof tabConfigSchema>;
export type CreateAPIKeyInput = z.infer<typeof CreateAPIKeySchema>;
export type NotificationSettingsInput = z.infer<typeof NotificationSettingsInputSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type APIKey = z.infer<typeof APIKeySchema>;
