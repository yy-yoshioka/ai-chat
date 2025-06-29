import { z } from 'zod';

export const logLevelSchema = z.enum(['info', 'warning', 'error', 'debug']);
export const logSourceSchema = z.enum(['auth', 'database', 'system', 'chat']);

export const logEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  level: logLevelSchema,
  message: z.string(),
  source: z.string(),
  userId: z.string().optional(),
  details: z.string().optional(),
});

export type LogEntry = z.infer<typeof logEntrySchema>;
export type LogLevel = z.infer<typeof logLevelSchema>;
export type LogSource = z.infer<typeof logSourceSchema>;
