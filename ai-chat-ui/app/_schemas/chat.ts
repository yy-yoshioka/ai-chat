import { z } from 'zod';

export const chatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  startTime: z.string(),
  endTime: z.optional(z.string()),
  messageCount: z.number(),
  status: z.enum(['active', 'completed', 'error']),
  satisfaction: z.optional(z.number()),
  topic: z.string(),
  lastMessage: z.string(),
});

export const topicMetricSchema = z.object({
  topic: z.string(),
  count: z.number(),
});

export const chatMetricsSchema = z.object({
  totalChats: z.number(),
  activeChats: z.number(),
  avgSatisfaction: z.number(),
  avgResponseTime: z.number(),
  topTopics: z.array(topicMetricSchema),
});

export type ChatSession = z.infer<typeof chatSessionSchema>;
export type ChatMetrics = z.infer<typeof chatMetricsSchema>;
export type TopicMetric = z.infer<typeof topicMetricSchema>;