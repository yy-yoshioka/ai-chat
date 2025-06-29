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
