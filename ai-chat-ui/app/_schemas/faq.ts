import { z } from 'zod';

// FAQ Request Schemas
export const CreateFAQSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  organizationId: z.string().optional(),
});

export const UpdateFAQSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

// FAQ Response Schema
export const FAQSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
  organizationId: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const FAQListResponseSchema = z.object({
  faqs: z.array(FAQSchema),
});

// Type exports
export type CreateFAQRequest = z.infer<typeof CreateFAQSchema>;
export type UpdateFAQRequest = z.infer<typeof UpdateFAQSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type FAQListResponse = z.infer<typeof FAQListResponseSchema>;
