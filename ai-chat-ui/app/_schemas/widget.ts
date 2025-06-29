import { z } from 'zod';

// Widget types
export const Widget = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  description: z.string().optional(),
  companyId: z.string(),
  settings: z
    .object({
      primaryColor: z.string().optional(),
      welcomeMessage: z.string().optional(),
      placeholder: z.string().optional(),
      position: z.enum(['bottom-right', 'bottom-left']).optional(),
    })
    .optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const Widgets = z.array(Widget);

export type Widget = z.infer<typeof Widget>;

// Widget creation request
export const CreateWidgetRequest = z.object({
  name: z.string(),
  description: z.string().optional(),
  companyId: z.string(),
  settings: z
    .object({
      primaryColor: z.string().optional(),
      welcomeMessage: z.string().optional(),
      placeholder: z.string().optional(),
      position: z.enum(['bottom-right', 'bottom-left']).optional(),
    })
    .optional(),
});

export type CreateWidgetRequest = z.infer<typeof CreateWidgetRequest>;

// Widget update request
export const UpdateWidgetRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  settings: z
    .object({
      primaryColor: z.string().optional(),
      welcomeMessage: z.string().optional(),
      placeholder: z.string().optional(),
      position: z.enum(['bottom-right', 'bottom-left']).optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateWidgetRequest = z.infer<typeof UpdateWidgetRequest>;
