import { z } from 'zod';

export const settingsTabSchema = z.enum([
  'branding',
  'members',
  'widgets',
  'api',
  'notifications',
  'security',
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

export type SettingsTab = z.infer<typeof settingsTabSchema>;
export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;
export type ApiSettings = z.infer<typeof apiSettingsSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
export type Member = z.infer<typeof memberSchema>;
export type TabConfig = z.infer<typeof tabConfigSchema>;
