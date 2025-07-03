import cron from 'node-cron';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import * as dataRetentionService from '../services/dataRetentionService';

export const startDataRetentionCron = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Starting daily data retention cleanup');

    try {
      // Get all organizations with auto-delete enabled
      const organizations = await prisma.organization.findMany({
        include: {
          dataRetentionPolicy: true,
        },
      });

      for (const org of organizations) {
        const policy =
          org.dataRetentionPolicy ||
          (await dataRetentionService.getOrganizationRetentionPolicy(org.id));

        if (!policy.autoDelete) {
          logger.info(
            `Skipping retention for org ${org.id} - auto-delete disabled`
          );
          continue;
        }

        try {
          // Process each data type
          await Promise.allSettled([
            // Chat logs
            policy.anonymizeData
              ? dataRetentionService.anonymizeChatLogs(org.id, policy.chatLogs)
              : dataRetentionService.cleanupChatLogs(org.id, policy.chatLogs),

            // Webhook logs
            dataRetentionService.cleanupWebhookLogs(org.id, policy.webhookLogs),
          ]);

          logger.info(`Completed retention cleanup for organization ${org.id}`);
        } catch (error) {
          logger.error(`Failed retention cleanup for organization ${org.id}`, {
            error: error instanceof Error ? error.message : error,
          });
        }
      }

      // Global cleanup (not organization-specific)
      await Promise.allSettled([
        dataRetentionService.cleanupSystemMetrics(90), // 3 months default
        dataRetentionService.cleanupHealthChecks(7), // 1 week default
      ]);

      logger.info('Daily data retention cleanup completed');
    } catch (error) {
      logger.error('Data retention cron job failed', {
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  // Run weekly cleanup on Sundays at 3 AM for more intensive operations
  cron.schedule('0 3 * * 0', async () => {
    logger.info('Starting weekly data retention maintenance');

    try {
      // Vacuum and analyze database
      await prisma.$executeRaw`VACUUM ANALYZE`;

      // Clean up orphaned records
      await cleanupOrphanedRecords();

      logger.info('Weekly data retention maintenance completed');
    } catch (error) {
      logger.error('Weekly data retention maintenance failed', {
        error: error instanceof Error ? error.message : error,
      });
    }
  });

  logger.info('Data retention cron jobs started');
};

const cleanupOrphanedRecords = async () => {
  // Get all valid webhook IDs
  const validWebhookIds = await prisma.webhook
    .findMany({
      select: { id: true },
    })
    .then((webhooks) => webhooks.map((w) => w.id));

  // Clean up webhook logs without webhooks
  const orphanedWebhookLogs = await prisma.webhookLog.deleteMany({
    where: {
      webhookId: {
        notIn: validWebhookIds.length > 0 ? validWebhookIds : ['dummy-id'],
      },
    },
  });

  // Get all valid chat log IDs
  const validChatLogIds = await prisma.chatLog
    .findMany({
      select: { id: true },
    })
    .then((logs) => logs.map((l) => l.id));

  // Clean up message feedback without chat logs
  const orphanedFeedback = await prisma.messageFeedback.deleteMany({
    where: {
      chatLogId: {
        notIn: validChatLogIds.length > 0 ? validChatLogIds : ['dummy-id'],
      },
    },
  });

  logger.info('Orphaned records cleanup completed', {
    webhookLogs: orphanedWebhookLogs.count,
    messageFeedback: orphanedFeedback.count,
  });
};
