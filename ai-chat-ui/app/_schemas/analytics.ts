import { z } from 'zod';

// Query parameters for conversation flow
export const conversationFlowQuerySchema = z.object({
  widgetId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Query parameters for unresolved questions
export const unresolvedQuestionsQuerySchema = z.object({
  widgetId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['frequency', 'lastOccurred', 'firstOccurred']).default('frequency'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Conversation flow node
export const conversationNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['question', 'answer']),
  count: z.number().int().nonnegative(),
});

// Conversation flow link
export const conversationLinkSchema = z.object({
  source: z.string(),
  target: z.string(),
  value: z.number().int().positive(),
});

// Conversation flow response
export const conversationFlowResponseSchema = z.object({
  nodes: z.array(conversationNodeSchema),
  links: z.array(conversationLinkSchema),
  summary: z.object({
    totalFlows: z.number().int().nonnegative(),
    uniqueQuestions: z.number().int().nonnegative(),
    uniqueAnswers: z.number().int().nonnegative(),
  }),
});

// Unresolved question
export const unresolvedQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  frequency: z.number().int().positive(),
  widgetId: z.string(),
  widgetName: z.string(),
  firstOccurred: z.string().datetime(),
  lastOccurred: z.string().datetime(),
  status: z.enum(['unresolved', 'reviewing', 'resolved']).default('unresolved'),
  examples: z
    .array(
      z.object({
        chatLogId: z.string(),
        userAgent: z.string().optional(),
        createdAt: z.string().datetime(),
      })
    )
    .optional(),
});

// Unresolved questions response
export const unresolvedQuestionsResponseSchema = z.object({
  questions: z.array(unresolvedQuestionSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
  summary: z.object({
    totalUnresolved: z.number().int().nonnegative(),
    averageFrequency: z.number().nonnegative(),
    mostCommonWidget: z.string().optional(),
  }),
});

// Analytics summary
export const analyticsSummarySchema = z.object({
  totalChats: z.number().int().nonnegative(),
  totalUsers: z.number().int().nonnegative(),
  averageSatisfaction: z.number().min(0).max(5),
  responseTime: z.number().nonnegative(),
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
});

// Widget analytics
export const widgetAnalyticsSchema = z.object({
  widgetId: z.string(),
  widgetName: z.string(),
  metrics: z.object({
    totalChats: z.number().int().nonnegative(),
    uniqueUsers: z.number().int().nonnegative(),
    satisfactionRate: z.number().min(0).max(100),
    resolvedRate: z.number().min(0).max(100),
    averageResponseTime: z.number().nonnegative(),
  }),
  topQuestions: z.array(
    z.object({
      question: z.string(),
      count: z.number().int().positive(),
      satisfactionRate: z.number().min(0).max(100).optional(),
    })
  ),
  dailyStats: z.array(
    z.object({
      date: z.string().datetime(),
      chats: z.number().int().nonnegative(),
      users: z.number().int().nonnegative(),
      satisfaction: z.number().min(0).max(5).optional(),
    })
  ),
});

// Type exports
export type ConversationFlowQuery = z.infer<typeof conversationFlowQuerySchema>;
export type UnresolvedQuestionsQuery = z.infer<typeof unresolvedQuestionsQuerySchema>;
export type ConversationNode = z.infer<typeof conversationNodeSchema>;
export type ConversationLink = z.infer<typeof conversationLinkSchema>;
export type ConversationFlowResponse = z.infer<typeof conversationFlowResponseSchema>;
export type UnresolvedQuestion = z.infer<typeof unresolvedQuestionSchema>;
export type UnresolvedQuestionsResponse = z.infer<typeof unresolvedQuestionsResponseSchema>;
export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;
export type WidgetAnalytics = z.infer<typeof widgetAnalyticsSchema>;
