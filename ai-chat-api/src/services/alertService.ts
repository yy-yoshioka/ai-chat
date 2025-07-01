import { prisma } from '../lib/prisma';
import { Incident, IncidentUpdate } from '@prisma/client';
import { logger } from '../lib/logger';
import { healthMonitorService } from './healthMonitorService';

interface AlertThresholds {
  responseTime: number; // milliseconds
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  errorRate: number; // percentage
}

interface AlertCondition {
  service: string;
  metricType: string;
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AlertService {
  private static instance: AlertService;
  private alertCheckInterval: NodeJS.Timeout | null = null;
  private thresholds: AlertThresholds;

  private constructor() {
    this.thresholds = {
      responseTime: parseInt(
        process.env.ALERT_THRESHOLD_RESPONSE_TIME || '5000'
      ),
      memoryUsage: parseInt(process.env.ALERT_THRESHOLD_MEMORY_MB || '1024'),
      cpuUsage: parseInt(process.env.ALERT_THRESHOLD_CPU_PERCENT || '80'),
      errorRate: parseInt(process.env.ALERT_THRESHOLD_ERROR_RATE || '5'),
    };
  }

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  startMonitoring(intervalMs: number = 60000): void {
    logger.info('Starting alert monitoring', {
      intervalMs,
      thresholds: this.thresholds,
    });

    this.alertCheckInterval = setInterval(() => {
      this.checkAlertConditions().catch((error) => {
        logger.error('Alert check failed', error);
      });
    }, intervalMs);

    // Perform initial check
    this.checkAlertConditions();
  }

  stopMonitoring(): void {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = null;
    }
  }

  private async checkAlertConditions(): Promise<void> {
    const conditions = await this.evaluateConditions();

    for (const condition of conditions) {
      if (this.shouldTriggerAlert(condition)) {
        await this.createOrUpdateIncident(condition);
      }
    }

    // Check for resolved incidents
    await this.checkResolvedIncidents();
  }

  private async evaluateConditions(): Promise<AlertCondition[]> {
    const conditions: AlertCondition[] = [];
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Check response times
    const healthChecks = await prisma.healthCheck.findMany({
      where: {
        timestamp: { gte: fiveMinutesAgo },
      },
      orderBy: { timestamp: 'desc' },
    });

    const serviceResponseTimes = this.aggregateByService(
      healthChecks,
      'responseTime'
    );
    for (const [service, avgResponseTime] of Object.entries(
      serviceResponseTimes
    )) {
      if (avgResponseTime > this.thresholds.responseTime) {
        conditions.push({
          service,
          metricType: 'response_time',
          threshold: this.thresholds.responseTime,
          currentValue: avgResponseTime,
          severity: this.calculateSeverity(
            avgResponseTime,
            this.thresholds.responseTime
          ),
        });
      }
    }

    // Check memory usage
    const memoryMetrics = await prisma.systemMetric.findMany({
      where: {
        metricType: 'memory',
        timestamp: { gte: fiveMinutesAgo },
      },
      orderBy: { timestamp: 'desc' },
    });

    const avgMemory = this.calculateAverage(memoryMetrics.map((m) => m.value));
    if (avgMemory > this.thresholds.memoryUsage) {
      conditions.push({
        service: 'api',
        metricType: 'memory',
        threshold: this.thresholds.memoryUsage,
        currentValue: avgMemory,
        severity: this.calculateSeverity(
          avgMemory,
          this.thresholds.memoryUsage
        ),
      });
    }

    // Check service health status
    const unhealthyServices = healthChecks.filter(
      (hc) => hc.status === 'unhealthy'
    );
    const serviceGroups = this.groupBy(unhealthyServices, 'service');

    for (const [service, checks] of Object.entries(serviceGroups)) {
      if (checks.length >= 3) {
        // 3 consecutive unhealthy checks
        conditions.push({
          service,
          metricType: 'health_status',
          threshold: 0,
          currentValue: checks.length,
          severity: 'high',
        });
      }
    }

    return conditions;
  }

  private shouldTriggerAlert(condition: AlertCondition): boolean {
    // For now, always trigger alerts when conditions are met
    // In production, you might want to implement debouncing or rate limiting
    return true;
  }

  private async createOrUpdateIncident(
    condition: AlertCondition
  ): Promise<void> {
    // Check if there's an existing open incident for this condition
    const existingIncident = await prisma.incident.findFirst({
      where: {
        status: { notIn: ['resolved'] },
        affectedServices: { has: condition.service },
        title: { contains: condition.metricType },
      },
      include: { updates: true },
    });

    if (existingIncident) {
      // Update existing incident if severity has changed
      const lastUpdate = existingIncident.updates[0];
      if (!lastUpdate || lastUpdate.status !== condition.severity) {
        await this.addIncidentUpdate(
          existingIncident.id,
          condition.severity === 'critical' ? 'identified' : 'monitoring',
          `Alert condition persists. ${condition.metricType} is ${condition.currentValue} (threshold: ${condition.threshold})`
        );
      }
    } else {
      // Create new incident
      await this.createIncident(condition);
    }
  }

  private async createIncident(condition: AlertCondition): Promise<Incident> {
    const title = `${condition.service} ${condition.metricType} threshold exceeded`;
    const description = `The ${condition.metricType} for ${condition.service} has exceeded the threshold. Current value: ${condition.currentValue}, Threshold: ${condition.threshold}`;

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        severity: condition.severity,
        status: 'investigating',
        affectedServices: [condition.service],
      },
    });

    // Add initial update
    await this.addIncidentUpdate(
      incident.id,
      'investigating',
      `Automated alert triggered. Investigating ${condition.metricType} issue.`
    );

    logger.warn('Incident created', { incident, condition });
    return incident;
  }

  async addIncidentUpdate(
    incidentId: string,
    status: string,
    message: string,
    createdBy?: string
  ): Promise<IncidentUpdate> {
    // Update incident status
    await prisma.incident.update({
      where: { id: incidentId },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
      },
    });

    // Create update record
    return prisma.incidentUpdate.create({
      data: {
        incidentId,
        status,
        message,
        createdBy,
      },
    });
  }

  private async checkResolvedIncidents(): Promise<void> {
    const openIncidents = await prisma.incident.findMany({
      where: {
        status: { notIn: ['resolved'] },
      },
    });

    for (const incident of openIncidents) {
      const isResolved = await this.isIncidentResolved(incident);
      if (isResolved) {
        await this.addIncidentUpdate(
          incident.id,
          'resolved',
          'Automated resolution: Alert conditions no longer met.'
        );
        logger.info('Incident auto-resolved', { incidentId: incident.id });
      }
    }
  }

  private async isIncidentResolved(incident: Incident): Promise<boolean> {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Check if the services are healthy
    const healthChecks = await prisma.healthCheck.findMany({
      where: {
        service: { in: incident.affectedServices },
        timestamp: { gte: tenMinutesAgo },
      },
      orderBy: { timestamp: 'desc' },
    });

    // All recent checks should be healthy
    return healthChecks.every((check) => check.status === 'healthy');
  }

  private calculateSeverity(
    currentValue: number,
    threshold: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = currentValue / threshold;
    if (ratio >= 2) return 'critical';
    if (ratio >= 1.5) return 'high';
    if (ratio >= 1.2) return 'medium';
    return 'low';
  }

  private aggregateByService(
    healthChecks: any[],
    field: string
  ): Record<string, number> {
    const grouped = this.groupBy(healthChecks, 'service');
    const result: Record<string, number> = {};

    for (const [service, checks] of Object.entries(grouped)) {
      const values = checks.map((c) => c[field]);
      result[service] = this.calculateAverage(values);
    }

    return result;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (acc, item) => {
        const groupKey = String(item[key]);
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
      },
      {} as Record<string, T[]>
    );
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return prisma.incident.findMany({
      where: {
        status: { notIn: ['resolved'] },
      },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getIncidentHistory(days: number = 30): Promise<Incident[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return prisma.incident.findMany({
      where: {
        createdAt: { gte: since },
      },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const alertService = AlertService.getInstance();
