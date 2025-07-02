import { Request, Response, NextFunction } from 'express';
import { Permission } from '@prisma/client';
import { hasPermission, hasAnyPermission } from '../services/rbacService';
import {
  logSecurityEvent,
  logDataAccess as logDataAccessService,
} from '../services/securityService';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

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
          risk_level: 'medium',
        });

        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasRequiredPermission = await hasPermission(
        req.user.id,
        req.organizationId,
        permission
      );

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
          risk_level: 'medium',
        });

        return res.status(403).json({ error: 'Insufficient permissions' });
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
        risk_level: 'low',
      });

      next();
    } catch (error) {
      await logSecurityEvent({
        userId: req.user?.id,
        organizationId: req.organizationId,
        action: 'permission_check_error',
        resource: req.path,
        success: false,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        risk_level: 'high',
      });

      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const requireAnyPermission = (permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id || !req.organizationId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasRequiredPermissions = await hasAnyPermission(
        req.user.id,
        req.organizationId,
        permissions
      );

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
          risk_level: 'medium',
        });

        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Data access logging middleware
export const logDataAccess = (tableName: string, operation: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Log the data access
      if (req.user?.id && req.organizationId) {
        logDataAccessService({
          organizationId: req.organizationId,
          userId: req.user.id,
          table_name: tableName,
          operation,
          record_ids: extractRecordIds(req, data),
          query_hash: generateQueryHash(req),
        }).catch((error) => {
          console.error('Failed to log data access:', error);
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

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
      return `${req.organizationId || 'anonymous'}:${req.ip}`;
    },
    skip: (req) => {
      // Skip rate limiting for system admins
      return req.user?.roles?.includes('owner') || false;
    },
  });
};

// IP allowlist middleware
export const requireIPAllowlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.organizationId) {
      return next();
    }

    const org = await prisma.organization.findUnique({
      where: { id: req.organizationId },
      select: { settings: true },
    });

    const ipAllowlist = org?.settings?.ipAllowlist as string[] | undefined;

    if (ipAllowlist && ipAllowlist.length > 0) {
      const clientIP = req.ip;
      const isAllowed = ipAllowlist.some((allowedIP) => {
        return clientIP === allowedIP || clientIP.startsWith(allowedIP);
      });

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
          risk_level: 'high',
        });

        return res.status(403).json({ error: 'IP address not allowed' });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

const extractRecordIds = (req: Request, responseData: any): string[] => {
  // Extract record IDs from request params, body, or response
  const ids: string[] = [];

  if (req.params.id) ids.push(req.params.id);
  if (req.body?.id) ids.push(req.body.id);

  try {
    const data =
      typeof responseData === 'string'
        ? JSON.parse(responseData)
        : responseData;
    if (data?.id) ids.push(data.id);
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item?.id) ids.push(item.id);
      });
    }
  } catch (error) {
    // Ignore JSON parse errors
  }

  return ids;
};

const generateQueryHash = (req: Request): string => {
  const queryString = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
  return crypto.createHash('sha256').update(queryString).digest('hex');
};
