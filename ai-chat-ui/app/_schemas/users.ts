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

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

export const userListResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number().int().min(0),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().min(0),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

export const userInviteSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema,
  organizationId: z.string().uuid(),
});

export const userInviteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  inviteId: z.string().uuid().optional(),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserInvite = z.infer<typeof userInviteSchema>;
export type UserInviteResponse = z.infer<typeof userInviteResponseSchema>;
