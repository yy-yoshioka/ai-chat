import { z } from 'zod';

// API key permissions
export const apiKeyPermissionsEnum = z.enum([
  'chat:read',
  'chat:write',
  'widget:read',
  'widget:write',
  'analytics:read',
  'faq:read',
  'faq:write',
  'knowledge_base:read',
  'knowledge_base:write',
  'settings:read',
  'settings:write',
]);

// API key status
export const apiKeyStatusEnum = z.enum(['active', 'inactive', 'expired', 'revoked']);

// Base API key schema
export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  key: z.string().min(32).max(64).optional(), // Only returned on creation
  keyPrefix: z.string().length(8), // First 8 characters for identification
  permissions: z.array(apiKeyPermissionsEnum).min(1),
  status: apiKeyStatusEnum.default('active'),
  organizationId: z.string(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  description: z.string().max(500).optional(),
  allowedOrigins: z.array(z.string().url()).optional(),
  allowedIPs: z.array(z.string().ip()).optional(),
  rateLimit: z
    .object({
      requests: z.number().int().positive(),
      window: z.enum(['second', 'minute', 'hour', 'day']),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Create API key request
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(apiKeyPermissionsEnum).min(1),
  description: z.string().max(500).optional(),
  expiresAt: z.string().datetime().optional(),
  allowedOrigins: z.array(z.string().url()).optional(),
  allowedIPs: z.array(z.string().ip()).optional(),
  rateLimit: z
    .object({
      requests: z.number().int().positive().max(10000),
      window: z.enum(['second', 'minute', 'hour', 'day']),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Update API key request
export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(apiKeyPermissionsEnum).min(1).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  expiresAt: z.string().datetime().optional(),
  allowedOrigins: z.array(z.string().url()).optional(),
  allowedIPs: z.array(z.string().ip()).optional(),
  rateLimit: z
    .object({
      requests: z.number().int().positive().max(10000),
      window: z.enum(['second', 'minute', 'hour', 'day']),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

// API key usage statistics
export const apiKeyUsageSchema = z.object({
  apiKeyId: z.string(),
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  totalRequests: z.number().int().nonnegative(),
  successfulRequests: z.number().int().nonnegative(),
  failedRequests: z.number().int().nonnegative(),
  requestsByEndpoint: z.record(z.number().int().nonnegative()),
  requestsByStatus: z.record(z.number().int().nonnegative()),
  averageResponseTime: z.number().nonnegative(),
  peakHour: z
    .object({
      hour: z.number().int().min(0).max(23),
      requests: z.number().int().nonnegative(),
    })
    .optional(),
});

// API key query parameters
export const apiKeyQuerySchema = z.object({
  status: apiKeyStatusEnum.optional(),
  search: z.string().optional(),
  permission: apiKeyPermissionsEnum.optional(),
  createdBy: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'lastUsedAt', 'name', 'expiresAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// API keys list response
export const apiKeyListResponseSchema = z.object({
  apiKeys: z.array(apiKeySchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
  summary: z.object({
    totalKeys: z.number().int().nonnegative(),
    activeKeys: z.number().int().nonnegative(),
    expiringKeys: z.number().int().nonnegative(),
    revokedKeys: z.number().int().nonnegative(),
  }),
});

// API key validation
export const validateApiKeySchema = z.object({
  key: z.string().min(32).max(64),
  endpoint: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
});

// API key validation response
export const apiKeyValidationResponseSchema = z.object({
  valid: z.boolean(),
  apiKeyId: z.string().optional(),
  permissions: z.array(apiKeyPermissionsEnum).optional(),
  rateLimit: z
    .object({
      remaining: z.number().int().nonnegative(),
      reset: z.string().datetime(),
    })
    .optional(),
  error: z.string().optional(),
});

// Type exports
export type ApiKeyPermission = z.infer<typeof apiKeyPermissionsEnum>;
export type ApiKeyStatus = z.infer<typeof apiKeyStatusEnum>;
export type ApiKey = z.infer<typeof apiKeySchema>;
export type CreateApiKey = z.infer<typeof createApiKeySchema>;
export type UpdateApiKey = z.infer<typeof updateApiKeySchema>;
export type ApiKeyUsage = z.infer<typeof apiKeyUsageSchema>;
export type ApiKeyQuery = z.infer<typeof apiKeyQuerySchema>;
export type ApiKeyListResponse = z.infer<typeof apiKeyListResponseSchema>;
export type ValidateApiKey = z.infer<typeof validateApiKeySchema>;
export type ApiKeyValidationResponse = z.infer<typeof apiKeyValidationResponseSchema>;
