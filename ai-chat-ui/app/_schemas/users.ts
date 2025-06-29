import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'member', 'guest']);
export const userStatusSchema = z.enum(['active', 'inactive', 'pending']);

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  status: userStatusSchema,
  lastLogin: z.string().optional(),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
