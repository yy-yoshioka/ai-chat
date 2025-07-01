// Auth related types
export * from './auth';

// Billing related types
export * from './billing';

// Chat related types
export * from './chat';

// FAQ related types
export * from './faq';

// Widget related types
export * from './widget';

// Trial related types
export * from './trial';

// Analytics related types
export * from './analytics';

// Notifications related types
export * from './notifications';

// API Keys related types
export * from './api-keys';

// System Health related types
export * from './system-health';

// Common Response Schemas
import { z } from 'zod';

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export const CancelResponseSchema = z.object({
  success: z.boolean(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type CancelResponse = z.infer<typeof CancelResponseSchema>;
