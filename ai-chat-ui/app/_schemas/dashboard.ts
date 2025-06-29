import { z } from 'zod';

export const statDataSchema = z.object({
  value: z.union([z.number(), z.string()]),
  icon: z.string(),
  color: z.string(),
});

export const chartDataSchema = z.object({
  chartType: z.string(),
  data: z.array(z.unknown()),
});

export const activitySchema = z.object({
  id: z.number(),
  action: z.string(),
  user: z.string(),
  time: z.string(),
});

export const activityDataSchema = z.object({
  activities: z.array(activitySchema),
});

export const healthItemSchema = z.object({
  name: z.string(),
  status: z.enum(['good', 'warning', 'error']),
  percentage: z.number(),
});

export const healthDataSchema = z.object({
  items: z.array(healthItemSchema),
});

export const dashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['stat', 'chart', 'activity', 'health']),
  title: z.string(),
  position: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
  data: z.optional(z.union([statDataSchema, chartDataSchema, activityDataSchema, healthDataSchema])),
  config: z.optional(z.record(z.unknown())),
});

export const dashboardStatsSchema = z.object({
  totalUsers: z.number(),
  activeChats: z.number(),
  faqCount: z.number(),
  systemHealth: z.string(),
  todayMessages: z.number(),
  responseTime: z.number(),
  apiCalls: z.number(),
  tokenUsage: z.number(),
  csat: z.number(),
});

export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;
export type StatData = z.infer<typeof statDataSchema>;
export type ChartData = z.infer<typeof chartDataSchema>;
export type ActivityData = z.infer<typeof activityDataSchema>;
export type HealthData = z.infer<typeof healthDataSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;