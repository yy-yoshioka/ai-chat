import { z } from 'zod';

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  isAdmin: z.boolean(),
  createdAt: z.string(),
});

export const activityStatsSchema = z.object({
  totalMessages: z.number(),
  totalChats: z.number(),
  lastActiveDate: z.string().optional(),
  daysActive: z.number(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type ActivityStats = z.infer<typeof activityStatsSchema>;
