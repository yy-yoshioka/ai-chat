# Section-16: Security Hardening 設計書

**todo-key: `security-hardening`**

## 概要
マルチテナント環境でのセキュリティ強化。Storage・VectorDB隔離、RBAC（Role-Based Access Control）Middleware、セキュリティ監査機能の実装を行います。

## 実装範囲

### 1. Enhanced RBAC System

#### Prisma Schema 拡張
```prisma
// 既存のRole enumを拡張
enum Role {
  owner
  org_admin
  editor
  viewer
  api_user      // API専用ユーザー
  read_only     // 読み取り専用
}

enum Permission {
  // Organization management
  ORG_READ
  ORG_WRITE
  ORG_DELETE
  ORG_INVITE_USERS
  
  // Widget management
  WIDGET_READ
  WIDGET_WRITE
  WIDGET_DELETE
  WIDGET_CONFIGURE
  
  // Chat management
  CHAT_READ
  CHAT_MODERATE
  CHAT_EXPORT
  
  // Knowledge Base
  KB_READ
  KB_WRITE
  KB_DELETE
  KB_TRAIN
  
  // Analytics
  ANALYTICS_READ
  ANALYTICS_EXPORT
  
  // Settings
  SETTINGS_READ
  SETTINGS_WRITE
  BILLING_READ
  BILLING_WRITE
  
  // System admin
  SYSTEM_ADMIN
  AUDIT_READ
}

model RolePermission {
  id         String     @id @default(cuid())
  role       Role
  permission Permission
  
  @@unique([role, permission])
  @@map("role_permissions")
}

model UserPermissionOverride {
  id           String     @id @default(cuid())
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId String
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  permission   Permission
  granted      Boolean    // true = grant, false = revoke
  createdAt    DateTime   @default(now())
  createdBy    String
  
  @@unique([userId, organizationId, permission])
  @@index([userId])
  @@index([organizationId])
  @@map("user_permission_overrides")
}

model SecurityAuditLog {
  id             String   @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String?
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  action         String   // "login", "permission_change", "data_access", etc.
  resource       String?  // Resource being accessed
  resourceId     String?  // ID of the resource
  
  success        Boolean
  ipAddress      String?
  userAgent      String?
  
  details        Json?    // Additional context
  risk_level     String   @default("low") // "low", "medium", "high", "critical"
  
  createdAt      DateTime @default(now())
  
  @@index([organizationId])
  @@index([userId])
  @@index([action])
  @@index([success])
  @@index([risk_level])
  @@index([createdAt])
  @@map("security_audit_logs")
}

model DataAccessLog {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String?
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  table_name     String   // "chat_logs", "knowledge_bases", etc.
  operation      String   // "SELECT", "INSERT", "UPDATE", "DELETE"
  record_ids     String[] // Array of affected record IDs
  query_hash     String?  // Hash of the executed query
  
  createdAt      DateTime @default(now())
  
  @@index([organizationId])
  @@index([userId])
  @@index([table_name])
  @@index([operation])
  @@index([createdAt])
  @@map("data_access_logs")
}

// Update existing models to add security relations
model User {
  // ... existing fields
  permissionOverrides UserPermissionOverride[]
  securityAuditLogs   SecurityAuditLog[]
  dataAccessLogs      DataAccessLog[]
}

model Organization {
  // ... existing fields
  permissionOverrides UserPermissionOverride[]
  securityAuditLogs   SecurityAuditLog[]
  dataAccessLogs      DataAccessLog[]
}
```

### 2. RBAC Service (`ai-chat-api/src/services/rbacService.ts`)

```typescript
import { prisma } from '../lib/prisma'
import { Role, Permission } from '@prisma/client'

// Default role permissions mapping
const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'ORG_READ', 'ORG_WRITE', 'ORG_DELETE', 'ORG_INVITE_USERS',
    'WIDGET_READ', 'WIDGET_WRITE', 'WIDGET_DELETE', 'WIDGET_CONFIGURE',
    'CHAT_READ', 'CHAT_MODERATE', 'CHAT_EXPORT',
    'KB_READ', 'KB_WRITE', 'KB_DELETE', 'KB_TRAIN',
    'ANALYTICS_READ', 'ANALYTICS_EXPORT',
    'SETTINGS_READ', 'SETTINGS_WRITE', 'BILLING_READ', 'BILLING_WRITE'
  ] as Permission[],
  
  org_admin: [
    'ORG_READ', 'ORG_WRITE', 'ORG_INVITE_USERS',
    'WIDGET_READ', 'WIDGET_WRITE', 'WIDGET_DELETE', 'WIDGET_CONFIGURE',
    'CHAT_READ', 'CHAT_MODERATE', 'CHAT_EXPORT',
    'KB_READ', 'KB_WRITE', 'KB_DELETE', 'KB_TRAIN',
    'ANALYTICS_READ', 'ANALYTICS_EXPORT',
    'SETTINGS_READ', 'SETTINGS_WRITE'
  ] as Permission[],
  
  editor: [
    'ORG_READ',
    'WIDGET_READ', 'WIDGET_WRITE', 'WIDGET_CONFIGURE',
    'CHAT_READ', 'CHAT_MODERATE',
    'KB_READ', 'KB_WRITE', 'KB_TRAIN',
    'ANALYTICS_READ',
    'SETTINGS_READ'
  ] as Permission[],
  
  viewer: [
    'ORG_READ',
    'WIDGET_READ',
    'CHAT_READ',
    'KB_READ',
    'ANALYTICS_READ',
    'SETTINGS_READ'
  ] as Permission[],
  
  api_user: [
    'WIDGET_READ', 'WIDGET_CONFIGURE',
    'CHAT_READ',
    'KB_READ'
  ] as Permission[],
  
  read_only: [
    'ORG_READ',
    'WIDGET_READ',
    'CHAT_READ',
    'KB_READ',
    'ANALYTICS_READ'
  ] as Permission[]
}

export const initializeRolePermissions = async () => {
  for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role: role as Role,
            permission: permission as Permission
          }
        },
        update: {},
        create: {
          role: role as Role,
          permission: permission as Permission
        }
      })
    }
  }
}

export const getUserPermissions = async (
  userId: string, 
  organizationId: string
): Promise<Permission[]> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      permissionOverrides: {
        where: { organizationId }
      }
    }
  })

  if (!user) {
    return []
  }

  // Get base permissions from roles
  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      role: {
        in: user.roles
      }
    },
    select: { permission: true }
  })

  let permissions = new Set(rolePermissions.map(rp => rp.permission))

  // Apply permission overrides
  for (const override of user.permissionOverrides) {
    if (override.granted) {
      permissions.add(override.permission)
    } else {
      permissions.delete(override.permission)
    }
  }

  return Array.from(permissions)
}

export const hasPermission = async (
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId, organizationId)
  return permissions.includes(permission)
}

export const hasAnyPermission = async (
  userId: string,
  organizationId: string,
  permissions: Permission[]
): Promise<boolean> => {
  const userPermissions = await getUserPermissions(userId, organizationId)
  return permissions.some(p => userPermissions.includes(p))
}

export const grantPermission = async (
  userId: string,
  organizationId: string,
  permission: Permission,
  grantedBy: string
) => {
  return prisma.userPermissionOverride.upsert({
    where: {
      userId_organizationId_permission: {
        userId,
        organizationId,
        permission
      }
    },
    update: {
      granted: true,
      createdBy: grantedBy
    },
    create: {
      userId,
      organizationId,
      permission,
      granted: true,
      createdBy: grantedBy
    }
  })
}

export const revokePermission = async (
  userId: string,
  organizationId: string,
  permission: Permission,
  revokedBy: string
) => {
  return prisma.userPermissionOverride.upsert({
    where: {
      userId_organizationId_permission: {
        userId,
        organizationId,
        permission
      }
    },
    update: {
      granted: false,
      createdBy: revokedBy
    },
    create: {
      userId,
      organizationId,
      permission,
      granted: false,
      createdBy: revokedBy
    }
  })
}

export const getOrganizationUsers = async (organizationId: string) => {
  return prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      email: true,
      name: true,
      roles: true,
      permissionOverrides: {
        where: { organizationId },
        select: {
          permission: true,
          granted: true
        }
      }
    }
  })
}
```

### 3. Security Middleware (`ai-chat-api/src/middleware/security.ts`)

```typescript
import { Request, Response, NextFunction } from 'express'
import { Permission } from '@prisma/client'
import { hasPermission, hasAnyPermission } from '../services/rbacService'
import { logSecurityEvent, logDataAccess } from '../services/securityService'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma'

// Enhanced auth middleware with RBAC
export const requirePermission = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id || !req.organizationId) {
        await logSecurityEvent({
          action: 'unauthorized_access_attempt',
          resource: req.path,
          success: false,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          risk_level: 'medium'
        })
        
        return res.status(401).json({ error: 'Authentication required' })
      }

      const hasRequiredPermission = await hasPermission(
        req.user.id,
        req.organizationId,
        permission
      )

      if (!hasRequiredPermission) {
        await logSecurityEvent({
          userId: req.user.id,
          organizationId: req.organizationId,
          action: 'permission_denied',
          resource: req.path,
          success: false,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { required_permission: permission },
          risk_level: 'medium'
        })
        
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      await logSecurityEvent({
        userId: req.user.id,
        organizationId: req.organizationId,
        action: 'permission_granted',
        resource: req.path,
        success: true,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { granted_permission: permission },
        risk_level: 'low'
      })

      next()
    } catch (error) {
      await logSecurityEvent({
        userId: req.user?.id,
        organizationId: req.organizationId,
        action: 'permission_check_error',
        resource: req.path,
        success: false,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        risk_level: 'high'
      })
      
      res.status(500).json({ error: 'Permission check failed' })
    }
  }
}

export const requireAnyPermission = (permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id || !req.organizationId) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const hasRequiredPermissions = await hasAnyPermission(
        req.user.id,
        req.organizationId,
        permissions
      )

      if (!hasRequiredPermissions) {
        await logSecurityEvent({
          userId: req.user.id,
          organizationId: req.organizationId,
          action: 'permission_denied',
          resource: req.path,
          success: false,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { required_permissions: permissions },
          risk_level: 'medium'
        })
        
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      next()
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' })
    }
  }
}

// Data access logging middleware
export const logDataAccess = (tableName: string, operation: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send

    res.send = function(data) {
      // Log the data access
      if (req.user?.id && req.organizationId) {
        logDataAccess({
          organizationId: req.organizationId,
          userId: req.user.id,
          table_name: tableName,
          operation,
          record_ids: extractRecordIds(req, data),
          query_hash: generateQueryHash(req)
        }).catch(error => {
          console.error('Failed to log data access:', error)
        })
      }

      return originalSend.call(this, data)
    }

    next()
  }
}

// Rate limiting with organization-specific limits
export const createOrgRateLimit = (
  windowMs: number,
  maxRequests: number,
  message?: string
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: message || 'Too many requests',
    keyGenerator: (req) => {
      return `${req.organizationId || 'anonymous'}:${req.ip}`
    },
    skip: (req) => {
      // Skip rate limiting for system admins
      return req.user?.roles?.includes('owner') || false
    }
  })
}

// IP allowlist middleware
export const requireIPAllowlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizationId) {
      return next()
    }

    const org = await prisma.organization.findUnique({
      where: { id: req.organizationId },
      select: { settings: true }
    })

    const ipAllowlist = org?.settings?.ipAllowlist as string[]
    
    if (ipAllowlist && ipAllowlist.length > 0) {
      const clientIP = req.ip
      const isAllowed = ipAllowlist.some(allowedIP => {
        return clientIP === allowedIP || clientIP.startsWith(allowedIP)
      })

      if (!isAllowed) {
        await logSecurityEvent({
          userId: req.user?.id,
          organizationId: req.organizationId,
          action: 'ip_blocked',
          resource: req.path,
          success: false,
          ipAddress: clientIP,
          userAgent: req.get('User-Agent'),
          details: { allowlist: ipAllowlist },
          risk_level: 'high'
        })
        
        return res.status(403).json({ error: 'IP address not allowed' })
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

const extractRecordIds = (req: Request, responseData: any): string[] => {
  // Extract record IDs from request params, body, or response
  const ids: string[] = []
  
  if (req.params.id) ids.push(req.params.id)
  if (req.body?.id) ids.push(req.body.id)
  
  try {
    const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData
    if (data?.id) ids.push(data.id)
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item?.id) ids.push(item.id)
      })
    }
  } catch (error) {
    // Ignore JSON parse errors
  }
  
  return ids
}

const generateQueryHash = (req: Request): string => {
  const crypto = require('crypto')
  const queryString = `${req.method}:${req.path}:${JSON.stringify(req.query)}`
  return crypto.createHash('sha256').update(queryString).digest('hex')
}
```

### 4. Security Service (`ai-chat-api/src/services/securityService.ts`)

```typescript
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

interface SecurityEventData {
  organizationId?: string
  userId?: string
  action: string
  resource?: string
  resourceId?: string
  success: boolean
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
}

interface DataAccessData {
  organizationId: string
  userId?: string
  table_name: string
  operation: string
  record_ids: string[]
  query_hash?: string
}

export const logSecurityEvent = async (data: SecurityEventData) => {
  try {
    await prisma.securityAuditLog.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        success: data.success,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: data.details,
        risk_level: data.risk_level || 'low'
      }
    })

    // Log high-risk events to application logger
    if (data.risk_level === 'high' || data.risk_level === 'critical') {
      logger.warn('High-risk security event detected', {
        ...data,
        timestamp: new Date().toISOString()
      })
    }

    // Check for suspicious patterns
    await checkSuspiciousActivity(data)

  } catch (error) {
    logger.error('Failed to log security event', {
      error: error instanceof Error ? error.message : error,
      eventData: data
    })
  }
}

export const logDataAccess = async (data: DataAccessData) => {
  try {
    await prisma.dataAccessLog.create({
      data
    })
  } catch (error) {
    logger.error('Failed to log data access', {
      error: error instanceof Error ? error.message : error,
      accessData: data
    })
  }
}

const checkSuspiciousActivity = async (event: SecurityEventData) => {
  if (!event.userId || !event.organizationId) return

  const timeWindow = new Date()
  timeWindow.setMinutes(timeWindow.getMinutes() - 15) // 15 minutes

  // Check for multiple failed attempts
  const failedAttempts = await prisma.securityAuditLog.count({
    where: {
      userId: event.userId,
      organizationId: event.organizationId,
      success: false,
      createdAt: {
        gte: timeWindow
      }
    }
  })

  if (failedAttempts >= 5) {
    await logSecurityEvent({
      organizationId: event.organizationId,
      userId: event.userId,
      action: 'suspicious_activity_detected',
      success: true,
      details: {
        pattern: 'multiple_failed_attempts',
        count: failedAttempts,
        timeWindow: '15_minutes'
      },
      risk_level: 'critical'
    })

    // Could trigger additional security measures here
    // e.g., temporary account lock, notification to admins
  }
}

export const getSecurityReport = async (
  organizationId: string,
  startDate: Date,
  endDate: Date
) => {
  const [
    totalEvents,
    failedEvents,
    highRiskEvents,
    topActions,
    topUsers,
    dataAccess
  ] = await Promise.all([
    // Total security events
    prisma.securityAuditLog.count({
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate }
      }
    }),

    // Failed events
    prisma.securityAuditLog.count({
      where: {
        organizationId,
        success: false,
        createdAt: { gte: startDate, lte: endDate }
      }
    }),

    // High-risk events
    prisma.securityAuditLog.count({
      where: {
        organizationId,
        risk_level: { in: ['high', 'critical'] },
        createdAt: { gte: startDate, lte: endDate }
      }
    }),

    // Top actions
    prisma.securityAuditLog.groupBy({
      by: ['action'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 10
    }),

    // Top users by activity
    prisma.securityAuditLog.groupBy({
      by: ['userId'],
      where: {
        organizationId,
        userId: { not: null },
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10
    }),

    // Data access summary
    prisma.dataAccessLog.groupBy({
      by: ['table_name', 'operation'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { table_name: true }
    })
  ])

  return {
    summary: {
      totalEvents,
      failedEvents,
      highRiskEvents,
      successRate: totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents * 100).toFixed(2) : '100'
    },
    topActions: topActions.map(item => ({
      action: item.action,
      count: item._count.action
    })),
    topUsers,
    dataAccess: dataAccess.map(item => ({
      table: item.table_name,
      operation: item.operation,
      count: item._count.table_name
    }))
  }
}

export const getAnomalousActivity = async (organizationId: string) => {
  const timeWindow = new Date()
  timeWindow.setHours(timeWindow.getHours() - 24) // Last 24 hours

  // Users with unusual access patterns
  const suspiciousUsers = await prisma.securityAuditLog.findMany({
    where: {
      organizationId,
      createdAt: { gte: timeWindow },
      OR: [
        { risk_level: 'critical' },
        { action: 'suspicious_activity_detected' }
      ]
    },
    include: {
      user: {
        select: { email: true, name: true }
      }
    }
  })

  // Unusual data access patterns
  const unusualDataAccess = await prisma.dataAccessLog.groupBy({
    by: ['userId', 'table_name'],
    where: {
      organizationId,
      createdAt: { gte: timeWindow }
    },
    _count: { table_name: true },
    having: {
      table_name: { _count: { gt: 100 } } // More than 100 accesses
    }
  })

  return {
    suspiciousUsers,
    unusualDataAccess
  }
}
```

### 5. Multi-tenant Storage Isolation

#### S3 Storage Service (`ai-chat-api/src/services/storageService.ts`)

```typescript
import AWS from 'aws-sdk'
import { logger } from '../lib/logger'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

export class SecureStorageService {
  private bucket: string

  constructor() {