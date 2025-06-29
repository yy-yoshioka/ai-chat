import { z } from 'zod';

// Company schema
export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  plan: z.string(),
});

// Enhanced widget schema with settings page requirements
export const widgetSettingsSchema = z.object({
  id: z.string(),
  widgetKey: z.string(),
  name: z.string(),
  companyId: z.string(),
  isActive: z.boolean(),
  accentColor: z.string(),
  logoUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  company: z
    .object({
      id: z.string(),
      name: z.string(),
      plan: z.string(),
    })
    .optional(),
  _count: z
    .object({
      chatLogs: z.number(),
    })
    .optional(),
});

// Legacy Widget schema for backward compatibility
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

// Form schemas for settings page
export const createWidgetFormSchema = z.object({
  name: z.string().min(1, 'Widget name is required'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  companyId: z.string().min(1, 'Company is required'),
});

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

// Type exports
export type Widget = z.infer<typeof Widget>;
export type WidgetSettings = z.infer<typeof widgetSettingsSchema>;
export type Company = z.infer<typeof companySchema>;
export type CreateWidgetForm = z.infer<typeof createWidgetFormSchema>;
export type CreateWidgetRequest = z.infer<typeof CreateWidgetRequest>;
export type UpdateWidgetRequest = z.infer<typeof UpdateWidgetRequest>;
