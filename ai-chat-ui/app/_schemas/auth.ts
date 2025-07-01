// app/_schemas/auth.ts
import { z } from 'zod';
import { Role } from '../_domains/auth';

// Role は z.enum() に変換して再利用
export const RoleEnum = z.enum(Role);

/* -------------------------------------------------
 * 1. ドメイン列挙・サブ型
 * ------------------------------------------------*/

export const PermissionSchema = z.object({
  resource: z.string(), // e.g. 'widgets'
  actions: z.array(z.string()), // e.g. ['read','write']
});
export type Permission = z.infer<typeof PermissionSchema>;

export const OrgMembershipSchema = z.object({
  organizationId: z.string(),
  organizationName: z.string().optional(),
  roles: z.array(RoleEnum),
  permissions: z.array(PermissionSchema),
  joinedAt: z.string(), // ISO 文字列
});
export type OrgMembership = z.infer<typeof OrgMembershipSchema>;

/* -------------------------------------------------
 * 2. User
 * ------------------------------------------------*/
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  /** Prisma は name? と optional なので合わせる */
  name: z.string().optional(),

  /* ---------------- legacy fields -------------- */
  role: z.enum(['user', 'admin', 'super_admin']),
  organizationId: z.string().optional(),

  /* ---------------- new role system ------------ */
  roles: z.array(RoleEnum).optional(),
  organizations: z.array(OrgMembershipSchema).optional(),

  /* ---------------- misc ----------------------- */
  companyId: z.string().optional(),
  profileImage: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

/* -------------------------------------------------
 * 3. Organization
 * ------------------------------------------------*/
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  settings: z.any().optional(), // Json 型
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

/* -------------------------------------------------
 * 4. JWT Payload
 * ------------------------------------------------*/
export const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
  role: z.string(),
  orgId: z.string().optional(),
  exp: z.number(),
  iat: z.number(),
});
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
