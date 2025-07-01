import { z } from 'zod';

export const dailyStatSchema = z.object({
  date: z.string(),
  chats: z.number(),
  satisfaction: z.number(),
});

export const reportDataSchema = z.object({
  totalUsers: z.number(),
  totalChats: z.number(),
  avgSatisfaction: z.number(),
  responseTime: z.number(),
  dailyStats: z.array(dailyStatSchema),
});

export const dateRangeSchema = z.enum(['7days', '30days', '90days']);

export type DailyStat = z.infer<typeof dailyStatSchema>;
export type ReportData = z.infer<typeof reportDataSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;

export const reportQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  organizationId: z.string().uuid().optional(),
  format: z.enum(['json', 'csv']).default('json'),
  type: z.enum(['summary', 'chart', 'detailed']).default('summary'),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
