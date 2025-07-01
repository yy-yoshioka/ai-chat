import express from 'express';
import { authMiddleware as requireAuth } from '../middleware/auth';
import { healthMonitorService } from '../services/healthMonitorService';
import { alertService } from '../services/alertService';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

const router = express.Router();

// Public health check endpoint
router.get('/health', async (req, res) => {
  try {
    const status = await healthMonitorService.getLatestHealthStatus();

    // Determine overall health
    const allHealthy = Object.values(status).every(
      (s) => s.status === 'healthy'
    );
    const anyUnhealthy = Object.values(status).some(
      (s) => s.status === 'unhealthy'
    );

    const overallStatus = anyUnhealthy
      ? 'unhealthy'
      : allHealthy
        ? 'healthy'
        : 'degraded';

    res.status(overallStatus === 'unhealthy' ? 503 : 200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: status,
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Public status page data
router.get('/public', async (req, res) => {
  try {
    const [healthStatus, activeIncidents, sla] = await Promise.all([
      healthMonitorService.getLatestHealthStatus(),
      alertService.getActiveIncidents(),
      calculateSLA(),
    ]);

    // Simplify health status for public view
    const publicStatus = Object.entries(healthStatus).reduce(
      (acc, [service, status]) => {
        acc[service] = {
          status: status.status,
          message: status.message,
        };
        return acc;
      },
      {} as Record<string, any>
    );

    // Simplify incidents for public view
    const publicIncidents = activeIncidents.map((incident) => ({
      id: incident.id,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      affectedServices: incident.affectedServices,
      createdAt: incident.createdAt,
      updates: incident.updates?.slice(0, 3).map((update) => ({
        status: update.status,
        message: update.message,
        createdAt: update.createdAt,
      })),
    }));

    res.json({
      status: publicStatus,
      incidents: publicIncidents,
      sla,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to fetch public status', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Admin-only detailed metrics
router.get('/metrics', requireAuth, async (req, res) => {
  try {
    const { service, metricType, startDate, endDate } = req.query;

    const metrics = await healthMonitorService.getMetrics(
      service as string,
      metricType as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(metrics);
  } catch (error) {
    logger.error('Failed to fetch metrics', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Admin-only incidents management
router.get('/incidents', requireAuth, async (req, res) => {
  try {
    const { days } = req.query;
    const incidents = await alertService.getIncidentHistory(
      days ? parseInt(days as string) : 30
    );
    res.json(incidents);
  } catch (error) {
    logger.error('Failed to fetch incidents', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Create incident (admin only)
router.post('/incidents', requireAuth, async (req, res) => {
  try {
    const { title, description, severity, affectedServices } = req.body;

    if (!title || !description || !severity || !affectedServices) {
      return res.status(400).json({
        error:
          'Title, description, severity, and affected services are required',
      });
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        severity,
        status: 'investigating',
        affectedServices,
      },
    });

    // Add initial update
    await alertService.addIncidentUpdate(
      incident.id,
      'investigating',
      'Incident created manually',
      req.user?.id
    );

    res.status(201).json(incident);
  } catch (error) {
    logger.error('Failed to create incident', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Update incident
router.post('/incidents/:id/updates', requireAuth, async (req, res) => {
  try {
    const { status, message } = req.body;

    if (!status || !message) {
      return res.status(400).json({
        error: 'Status and message are required',
      });
    }

    const update = await alertService.addIncidentUpdate(
      req.params.id,
      status,
      message,
      req.user?.id
    );

    res.json(update);
  } catch (error) {
    logger.error('Failed to update incident', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Get specific incident
router.get('/incidents/:id', async (req, res) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    logger.error('Failed to fetch incident', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// Helper function to calculate SLA
async function calculateSLA(): Promise<{
  uptime: number;
  avgResponseTime: number;
  period: string;
}> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get health checks for the last 30 days
  const healthChecks = await prisma.healthCheck.findMany({
    where: {
      timestamp: { gte: thirtyDaysAgo },
    },
  });

  if (healthChecks.length === 0) {
    return { uptime: 100, avgResponseTime: 0, period: '30 days' };
  }

  // Calculate uptime percentage
  const totalChecks = healthChecks.length;
  const healthyChecks = healthChecks.filter(
    (hc) => hc.status === 'healthy'
  ).length;
  const uptime = (healthyChecks / totalChecks) * 100;

  // Calculate average response time
  const totalResponseTime = healthChecks.reduce(
    (sum, hc) => sum + hc.responseTime,
    0
  );
  const avgResponseTime = Math.round(totalResponseTime / totalChecks);

  return {
    uptime: Math.round(uptime * 100) / 100,
    avgResponseTime,
    period: '30 days',
  };
}

export default router;
