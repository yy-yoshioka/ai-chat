import express from 'express';
import { authMiddleware as requireAuth } from '../middleware/auth';
import { adminMiddleware as requireAdmin } from '../middleware/admin';
import { requirePermission } from '../middleware/security';
import { Permission } from '@prisma/client';
import * as rbacService from '../services/rbacService';
import * as securityService from '../services/securityService';
import {
  permissionGrantSchema,
  securityReportQuerySchema,
} from '../schemas/securitySchema';

const router = express.Router();

// Get organization users with permissions
router.get(
  '/users',
  requireAuth,
  requirePermission(Permission.ORG_READ),
  async (req, res) => {
    try {
      const users = await rbacService.getOrganizationUsers(req.organizationId!);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Get user permissions
router.get(
  '/users/:userId/permissions',
  requireAuth,
  requirePermission(Permission.ORG_READ),
  async (req, res) => {
    try {
      const permissions = await rbacService.getUserPermissions(
        req.params.userId,
        req.organizationId!
      );
      res.json({ permissions });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  }
);

// Grant permission to user
router.post(
  '/users/:userId/permissions',
  requireAuth,
  requirePermission(Permission.SYSTEM_ADMIN),
  async (req, res) => {
    try {
      const data = permissionGrantSchema.parse(req.body);

      await rbacService.grantPermission(
        req.params.userId,
        req.organizationId!,
        data.permission,
        req.user!.id
      );

      res.json({ message: 'Permission granted successfully' });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid request data' });
      } else {
        res.status(500).json({ error: 'Failed to grant permission' });
      }
    }
  }
);

// Revoke permission from user
router.delete(
  '/users/:userId/permissions/:permission',
  requireAuth,
  requirePermission(Permission.SYSTEM_ADMIN),
  async (req, res) => {
    try {
      await rbacService.revokePermission(
        req.params.userId,
        req.organizationId!,
        req.params.permission as Permission,
        req.user!.id
      );

      res.json({ message: 'Permission revoked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to revoke permission' });
    }
  }
);

// Get security report
router.get(
  '/report',
  requireAuth,
  requirePermission(Permission.AUDIT_READ),
  async (req, res) => {
    try {
      const query = securityReportQuerySchema.parse(req.query);

      const report = await securityService.getSecurityReport(
        req.organizationId!,
        new Date(query.startDate),
        new Date(query.endDate)
      );

      res.json(report);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid query parameters' });
      } else {
        res.status(500).json({ error: 'Failed to generate security report' });
      }
    }
  }
);

// Get anomalous activity
router.get(
  '/anomalies',
  requireAuth,
  requirePermission(Permission.SYSTEM_ADMIN),
  async (req, res) => {
    try {
      const anomalies = await securityService.getAnomalousActivity(
        req.organizationId!
      );
      res.json(anomalies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch anomalous activity' });
    }
  }
);

export default router;
