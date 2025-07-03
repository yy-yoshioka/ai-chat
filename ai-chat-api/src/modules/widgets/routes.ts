import express from 'express';
import { authMiddleware as requireAuth } from '../../middleware/auth';
import { orgAccessMiddleware as requireOrgAccess } from '../../middleware/organizationAccess';
import { requirePermission, logDataAccess } from '../../middleware/security';
import { Permission } from '@prisma/client';
import * as widgetService from './services/widgetService';

const router = express.Router();

// Get widgets by organization
router.get(
  '/',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_READ),
  logDataAccess('widgets', 'SELECT'),
  async (req, res) => {
    try {
      const { page, limit, search, status } = req.query;

      const result = await widgetService.getWidgetsByOrganization(
        req.organizationId!,
        {
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          search: search as string,
          status: status as 'active' | 'inactive' | 'all',
        }
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch widgets' });
    }
  }
);

// Create widget
router.post(
  '/',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  logDataAccess('widgets', 'INSERT'),
  async (req, res) => {
    try {
      const widget = await widgetService.createWidget({
        ...req.body,
        organizationId: req.organizationId!,
      });
      res.status(201).json(widget);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create widget';
      const status =
        message.includes('not found') || message.includes('access denied')
          ? 400
          : 500;
      res.status(status).json({ error: message });
    }
  }
);

// Get widget by ID
router.get(
  '/:id',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_READ),
  logDataAccess('widgets', 'SELECT'),
  async (req, res) => {
    try {
      const widget = await widgetService.getWidgetById(
        req.params.id,
        req.organizationId!
      );
      res.json(widget);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch widget';
      const status =
        message.includes('not found') || message.includes('access denied')
          ? 404
          : 500;
      res.status(status).json({ error: message });
    }
  }
);

// Update widget
router.put(
  '/:id',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_WRITE),
  logDataAccess('widgets', 'UPDATE'),
  async (req, res) => {
    try {
      const widget = await widgetService.updateWidget(
        req.params.id,
        req.organizationId!,
        req.body
      );
      res.json(widget);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update widget';
      const status =
        message.includes('not found') || message.includes('access denied')
          ? 404
          : 500;
      res.status(status).json({ error: message });
    }
  }
);

// Delete widget
router.delete(
  '/:id',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.WIDGET_DELETE),
  logDataAccess('widgets', 'DELETE'),
  async (req, res) => {
    try {
      await widgetService.deleteWidget(req.params.id, req.organizationId!);
      res.status(204).send();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete widget';
      const status =
        message.includes('not found') || message.includes('access denied')
          ? 404
          : 500;
      res.status(status).json({ error: message });
    }
  }
);

// Get widget analytics
router.get(
  '/:id/analytics',
  requireAuth,
  requireOrgAccess,
  requirePermission(Permission.ANALYTICS_READ),
  logDataAccess('analytics', 'SELECT'),
  async (req, res) => {
    try {
      const analytics = await widgetService.getWidgetAnalytics(
        req.params.id,
        req.organizationId!
      );
      res.json(analytics);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch widget analytics';
      const status =
        message.includes('not found') || message.includes('access denied')
          ? 404
          : 500;
      res.status(status).json({ error: message });
    }
  }
);

export default router;
