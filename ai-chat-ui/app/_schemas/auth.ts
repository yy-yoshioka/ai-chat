import { z } from 'zod';

// User types
export const User = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin', 'super']),
  orgId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof User>;

// Organization types
export const Organization = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Organization = z.infer<typeof Organization>;

// JWT Payload types
export const JWTPayload = z.object({
  userId: z.string(),
  email: z.string(),
  role: z.string(),
  orgId: z.string().optional(),
  exp: z.number(),
  iat: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayload>;
