import { z } from 'zod';

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
  userCount: z.number().int().min(0),
  widgetCount: z.number().int().min(0),
});

export const organizationStatsSchema = z.object({
  totalUsers: z.number().int().min(0),
  activeUsers: z.number().int().min(0),
  totalWidgets: z.number().int().min(0),
  totalChats: z.number().int().min(0),
  totalFaqs: z.number().int().min(0),
  storageUsed: z.number().min(0),
  apiCallsToday: z.number().int().min(0),
  lastActivityAt: z.string().datetime().optional(),
});

export const organizationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  settings: z.record(z.unknown()).optional(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationStats = z.infer<typeof organizationStatsSchema>;
export type OrganizationUpdate = z.infer<typeof organizationUpdateSchema>;