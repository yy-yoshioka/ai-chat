import { z } from 'zod';

export const dataRetentionPolicySchema = z.object({
  chatLogs: z.number().int().min(1).max(3650).optional(), // 1 day to 10 years
  messageFeedback: z.number().int().min(1).max(3650).optional(),
  systemMetrics: z.number().int().min(1).max(3650).optional(),
  webhookLogs: z.number().int().min(1).max(3650).optional(),
  healthChecks: z.number().int().min(1).max(3650).optional(),
  auditLogs: z.number().int().min(365).max(3650).optional(), // Min 1 year for compliance
  autoDelete: z.boolean().optional(),
  anonymizeData: z.boolean().optional(),
});

export const dataRetentionCleanupSchema = z.object({
  dataType: z.enum([
    'chat_logs',
    'webhook_logs',
    'system_metrics',
    'health_checks',
  ]),
});

export const globalCleanupSchema = z.object({
  dataType: z.enum(['system_metrics', 'health_checks']),
  retentionDays: z.number().int().min(1).max(3650).optional(),
});

export type DataRetentionPolicy = z.infer<typeof dataRetentionPolicySchema>;
export type DataRetentionCleanup = z.infer<typeof dataRetentionCleanupSchema>;
export type GlobalCleanup = z.infer<typeof globalCleanupSchema>;
