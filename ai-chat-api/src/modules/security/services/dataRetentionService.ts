import { prisma } from '@shared/database/prisma';
import { logger } from '@shared/logger';

export interface RetentionPolicy {
  chatLogs: number;
  messageFeedback: number;
  systemMetrics: number;
  webhookLogs: number;
  healthChecks: number;
  auditLogs: number;
  autoDelete: boolean;
  anonymizeData: boolean;
}

export const getOrganizationRetentionPolicy = async (
  organizationId: string
) => {
  let policy = await prisma.dataRetentionPolicy.findUnique({
    where: { organizationId },
  });

  if (!policy) {
    // Create default policy
    policy = await prisma.dataRetentionPolicy.create({
      data: {
        organizationId,
        chatLogs: 365,
        messageFeedback: 730,
        systemMetrics: 90,
        webhookLogs: 30,
        healthChecks: 7,
        auditLogs: 2555,
        autoDelete: true,
        anonymizeData: false,
      },
    });
  }

  return policy;
};

export const updateRetentionPolicy = async (
  organizationId: string,
  updates: Partial<RetentionPolicy>
) => {
  return prisma.dataRetentionPolicy.upsert({
    where: { organizationId },
    update: {
      ...updates,
      updatedAt: new Date(),
    },
    create: {
      organizationId,
      ...updates,
    },
  });
};

export const createRetentionJob = async (data: {
  organizationId?: string;
  jobType: string;
  metadata?: Record<string, unknown>;
}) => {
  return prisma.dataRetentionJob.create({
    data: {
      ...data,
      status: 'pending',
    },
  });
};

export const updateRetentionJob = async (
  jobId: string,
  updates: {
    status?: string;
    itemsProcessed?: number;
    itemsDeleted?: number;
    itemsAnonymized?: number;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
  }
) => {
  return prisma.dataRetentionJob.update({
    where: { id: jobId },
    data: updates,
  });
};

// Chat logs cleanup
export const cleanupChatLogs = async (
  organizationId: string,
  retentionDays: number
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const job = await createRetentionJob({
    organizationId,
    jobType: 'chat_logs',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays },
  });

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date(),
    });

    // Count items to be deleted
    const itemsToDelete = await prisma.chatLog.count({
      where: {
        widget: {
          company: {
            organizationId,
          },
        },
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // Delete chat logs and related feedback
    const deletedLogs = await prisma.chatLog.deleteMany({
      where: {
        widget: {
          company: {
            organizationId,
          },
        },
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: itemsToDelete,
      itemsDeleted: deletedLogs.count,
      completedAt: new Date(),
    });

    logger.info('Chat logs cleanup completed', {
      organizationId,
      deletedCount: deletedLogs.count,
      retentionDays,
    });

    return deletedLogs.count;
  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });

    logger.error('Chat logs cleanup failed', {
      organizationId,
      error: error instanceof Error ? error.message : error,
    });

    throw error;
  }
};

// System metrics cleanup
export const cleanupSystemMetrics = async (retentionDays: number) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const job = await createRetentionJob({
    jobType: 'system_metrics',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays },
  });

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date(),
    });

    const itemsToDelete = await prisma.systemMetric.count({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    const deletedMetrics = await prisma.systemMetric.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: itemsToDelete,
      itemsDeleted: deletedMetrics.count,
      completedAt: new Date(),
    });

    logger.info('System metrics cleanup completed', {
      deletedCount: deletedMetrics.count,
      retentionDays,
    });

    return deletedMetrics.count;
  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });

    logger.error('System metrics cleanup failed', {
      error: error instanceof Error ? error.message : error,
    });

    throw error;
  }
};

// Webhook logs cleanup
export const cleanupWebhookLogs = async (
  organizationId: string,
  retentionDays: number
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const job = await createRetentionJob({
    organizationId,
    jobType: 'webhook_logs',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays },
  });

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date(),
    });

    const itemsToDelete = await prisma.webhookLog.count({
      where: {
        webhook: {
          organizationId,
        },
        executedAt: {
          lt: cutoffDate,
        },
      },
    });

    const deletedLogs = await prisma.webhookLog.deleteMany({
      where: {
        webhook: {
          organizationId,
        },
        executedAt: {
          lt: cutoffDate,
        },
      },
    });

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: itemsToDelete,
      itemsDeleted: deletedLogs.count,
      completedAt: new Date(),
    });

    logger.info('Webhook logs cleanup completed', {
      organizationId,
      deletedCount: deletedLogs.count,
      retentionDays,
    });

    return deletedLogs.count;
  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });

    logger.error('Webhook logs cleanup failed', {
      organizationId,
      error: error instanceof Error ? error.message : error,
    });

    throw error;
  }
};

// Health checks cleanup
export const cleanupHealthChecks = async (retentionDays: number) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const job = await createRetentionJob({
    jobType: 'health_checks',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays },
  });

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date(),
    });

    const itemsToDelete = await prisma.healthCheck.count({
      where: {
        checkedAt: {
          lt: cutoffDate,
        },
      },
    });

    const deletedChecks = await prisma.healthCheck.deleteMany({
      where: {
        checkedAt: {
          lt: cutoffDate,
        },
      },
    });

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: itemsToDelete,
      itemsDeleted: deletedChecks.count,
      completedAt: new Date(),
    });

    logger.info('Health checks cleanup completed', {
      deletedCount: deletedChecks.count,
      retentionDays,
    });

    return deletedChecks.count;
  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });

    logger.error('Health checks cleanup failed', {
      error: error instanceof Error ? error.message : error,
    });

    throw error;
  }
};

// Data anonymization (GDPR compliance)
export const anonymizeChatLogs = async (
  organizationId: string,
  retentionDays: number
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const job = await createRetentionJob({
    organizationId,
    jobType: 'chat_logs_anonymization',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays },
  });

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date(),
    });

    // Find chat logs to anonymize
    const logsToAnonymize = await prisma.chatLog.findMany({
      where: {
        widget: {
          company: {
            organizationId,
          },
        },
        createdAt: {
          lt: cutoffDate,
        },
        userId: {
          not: null,
        },
      },
      select: { id: true },
    });

    // Anonymize by removing user references and PII
    const anonymizedLogs = await prisma.chatLog.updateMany({
      where: {
        id: {
          in: logsToAnonymize.map((log) => log.id),
        },
      },
      data: {
        userId: null,
        // Could add more anonymization logic here
      },
    });

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: logsToAnonymize.length,
      itemsAnonymized: anonymizedLogs.count,
      completedAt: new Date(),
    });

    logger.info('Chat logs anonymization completed', {
      organizationId,
      anonymizedCount: anonymizedLogs.count,
      retentionDays,
    });

    return anonymizedLogs.count;
  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });

    logger.error('Chat logs anonymization failed', {
      organizationId,
      error: error instanceof Error ? error.message : error,
    });

    throw error;
  }
};

// Get retention job history
export const getRetentionJobHistory = async (
  organizationId?: string,
  limit: number = 50
) => {
  return prisma.dataRetentionJob.findMany({
    where: organizationId ? { organizationId } : {},
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: organizationId
      ? {}
      : {
          organization: {
            select: { name: true },
          },
        },
  });
};
