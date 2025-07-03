import { prisma } from '@shared/database/prisma';
import { logger } from '@shared/logger';

interface SecurityEventData {
  organizationId?: string;
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
}

interface DataAccessData {
  organizationId: string;
  userId?: string;
  table_name: string;
  operation: string;
  record_ids: string[];
  query_hash?: string;
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
        risk_level: data.risk_level || 'low',
      },
    });

    // Log high-risk events to application logger
    if (data.risk_level === 'high' || data.risk_level === 'critical') {
      logger.warn('High-risk security event detected', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for suspicious patterns
    await checkSuspiciousActivity(data);
  } catch (error) {
    logger.error('Failed to log security event', {
      error: error instanceof Error ? error.message : error,
      eventData: data,
    });
  }
};

export const logDataAccess = async (data: DataAccessData) => {
  try {
    await prisma.dataAccessLog.create({
      data,
    });
  } catch (error) {
    logger.error('Failed to log data access', {
      error: error instanceof Error ? error.message : error,
      accessData: data,
    });
  }
};

const checkSuspiciousActivity = async (event: SecurityEventData) => {
  if (!event.userId || !event.organizationId) return;

  const timeWindow = new Date();
  timeWindow.setMinutes(timeWindow.getMinutes() - 15); // 15 minutes

  // Check for multiple failed attempts
  const failedAttempts = await prisma.securityAuditLog.count({
    where: {
      userId: event.userId,
      organizationId: event.organizationId,
      success: false,
      createdAt: {
        gte: timeWindow,
      },
    },
  });

  if (failedAttempts >= 5) {
    await logSecurityEvent({
      organizationId: event.organizationId,
      userId: event.userId,
      action: 'suspicious_activity_detected',
      success: true,
      details: {
        pattern: 'multiple_failed_attempts',
        count: failedAttempts,
        timeWindow: '15_minutes',
      },
      risk_level: 'critical',
    });

    // Could trigger additional security measures here
    // e.g., temporary account lock, notification to admins
  }
};

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
    dataAccess,
  ] = await Promise.all([
    // Total security events
    prisma.securityAuditLog.count({
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
    }),

    // Failed events
    prisma.securityAuditLog.count({
      where: {
        organizationId,
        success: false,
        createdAt: { gte: startDate, lte: endDate },
      },
    }),

    // High-risk events
    prisma.securityAuditLog.count({
      where: {
        organizationId,
        risk_level: { in: ['high', 'critical'] },
        createdAt: { gte: startDate, lte: endDate },
      },
    }),

    // Top actions
    prisma.securityAuditLog.groupBy({
      by: ['action'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    }),

    // Top users by activity
    prisma.securityAuditLog.groupBy({
      by: ['userId'],
      where: {
        organizationId,
        userId: { not: null },
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    }),

    // Data access summary
    prisma.dataAccessLog.groupBy({
      by: ['table_name', 'operation'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { table_name: true },
    }),
  ]);

  return {
    summary: {
      totalEvents,
      failedEvents,
      highRiskEvents,
      successRate:
        totalEvents > 0
          ? (((totalEvents - failedEvents) / totalEvents) * 100).toFixed(2)
          : '100',
    },
    topActions: topActions.map((item) => ({
      action: item.action,
      count: item._count.action,
    })),
    topUsers,
    dataAccess: dataAccess.map((item) => ({
      table: item.table_name,
      operation: item.operation,
      count: item._count.table_name,
    })),
  };
};

export const getAnomalousActivity = async (organizationId: string) => {
  const timeWindow = new Date();
  timeWindow.setHours(timeWindow.getHours() - 24); // Last 24 hours

  // Users with unusual access patterns
  const suspiciousUsers = await prisma.securityAuditLog.findMany({
    where: {
      organizationId,
      createdAt: { gte: timeWindow },
      OR: [
        { risk_level: 'critical' },
        { action: 'suspicious_activity_detected' },
      ],
    },
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
  });

  // Unusual data access patterns
  const unusualDataAccess = await prisma.dataAccessLog.groupBy({
    by: ['userId', 'table_name'],
    where: {
      organizationId,
      createdAt: { gte: timeWindow },
    },
    _count: { table_name: true },
    having: {
      table_name: { _count: { gt: 100 } }, // More than 100 accesses
    },
  });

  return {
    suspiciousUsers,
    unusualDataAccess,
  };
};
