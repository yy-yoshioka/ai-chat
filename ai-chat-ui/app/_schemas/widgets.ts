import { z } from 'zod';

export const widgetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  widgetKey: z.string(),
  companyId: z.string().uuid(),
  company: z.object({
    id: z.string().uuid(),
    name: z.string(),
    plan: z.enum(['free', 'pro', 'enterprise']),
  }),
  isActive: z.boolean(),
  theme: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  borderRadius: z.number(),
  fontFamily: z.string(),
  logoUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  _count: z
    .object({
      chatLogs: z.number().int().min(0),
    })
    .optional(),
});

export const widgetDetailSchema = widgetSchema.extend({
  knowledgeBases: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      status: z.string(),
      chunks: z.number().int().min(0),
      createdAt: z.string().datetime(),
    })
  ),
});

export const widgetCreateSchema = z.object({
  name: z.string().min(1),
  companyId: z.string().uuid(),
  theme: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderRadius: z.number().optional(),
  fontFamily: z.string().optional(),
});

export const widgetUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  theme: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderRadius: z.number().optional(),
  fontFamily: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
});

export const widgetListResponseSchema = z.object({
  widgets: z.array(widgetSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export const widgetAnalyticsSchema = z.object({
  totalChats: z.number().int().min(0),
  monthlyChats: z.number().int().min(0),
  avgSatisfaction: z.number().min(0).max(1),
  topQuestions: z.array(
    z.object({
      question: z.string(),
      count: z.number().int().min(0),
    })
  ),
});

export type Widget = z.infer<typeof widgetSchema>;
export type WidgetDetail = z.infer<typeof widgetDetailSchema>;
export type WidgetCreate = z.infer<typeof widgetCreateSchema>;
export type WidgetUpdate = z.infer<typeof widgetUpdateSchema>;
export type WidgetListResponse = z.infer<typeof widgetListResponseSchema>;
export type WidgetAnalytics = z.infer<typeof widgetAnalyticsSchema>;
