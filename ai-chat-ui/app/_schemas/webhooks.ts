import { z } from 'zod';

// Webhook event types
export const webhookEventTypes = [
  'chat.created',
  'user.created',
  'user.updated',
  'widget.created',
  'widget.updated',
  'widget.deleted',
  'knowledge_base.created',
  'knowledge_base.updated',
  'knowledge_base.deleted',
] as const;

export const webhookEventTypeSchema = z.enum(webhookEventTypes);

// Base webhook schema
export const webhookSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  secret: z.string(),
  events: z.array(webhookEventTypeSchema),
  isActive: z.boolean(),
  organizationId: z.string(),
  headers: z.record(z.string()).optional().nullable(),
  retryCount: z.number().int().min(0).max(10),
  timeoutMs: z.number().int().min(1000).max(60000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create webhook request
export const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(webhookEventTypeSchema).min(1),
  headers: z.record(z.string()).optional(),
  retryCount: z.number().int().min(0).max(10).optional(),
  timeoutMs: z.number().int().min(1000).max(60000).optional(),
});

// Update webhook request
export const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(webhookEventTypeSchema).min(1).optional(),
  isActive: z.boolean().optional(),
  headers: z.record(z.string()).optional(),
  retryCount: z.number().int().min(0).max(10).optional(),
  timeoutMs: z.number().int().min(1000).max(60000).optional(),
});

// Webhook log status
export const webhookLogStatusSchema = z.enum(['success', 'failed', 'pending']);

// Webhook log schema
export const webhookLogSchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  event: z.string(),
  payload: z.any(),
  status: webhookLogStatusSchema,
  statusCode: z.number().optional().nullable(),
  response: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
  attempts: z.number(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional().nullable(),
});

// Webhook logs query params
export const webhookLogsQuerySchema = z.object({
  status: webhookLogStatusSchema.optional(),
  event: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Types
export type Webhook = z.infer<typeof webhookSchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
export type WebhookLog = z.infer<typeof webhookLogSchema>;
export type WebhookLogStatus = z.infer<typeof webhookLogStatusSchema>;
export type WebhookEventType = z.infer<typeof webhookEventTypeSchema>;
export type WebhookLogsQuery = z.infer<typeof webhookLogsQuerySchema>;