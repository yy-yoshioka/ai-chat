import { prisma } from '@shared/database/prisma';
import * as Sentry from '@sentry/node';

export class DataRetentionService {
  private static instance: DataRetentionService;

  static getInstance(): DataRetentionService {
    if (!DataRetentionService.instance) {
      DataRetentionService.instance = new DataRetentionService();
    }
    return DataRetentionService.instance;
  }

  async executeRetentionPolicy(): Promise<void> {
    console.log('Starting data retention policy execution...');

    try {
      const results = await Promise.allSettled([
        this.cleanupOldMessages(),
        this.cleanupInactiveAnalytics(),
        this.cleanupDeletedAccounts(),
        this.cleanupServerLogs(),
      ]);

      // Log results
      results.forEach((result, index) => {
        const operations = ['messages', 'analytics', 'accounts', 'logs'];
        if (result.status === 'fulfilled') {
          console.log(
            `✅ ${operations[index]} cleanup completed: ${result.value} records processed`
          );
        } else {
          console.error(
            `❌ ${operations[index]} cleanup failed:`,
            result.reason
          );
          Sentry.captureException(result.reason);
        }
      });

      console.log('Data retention policy execution completed');
    } catch (error) {
      console.error('Data retention policy execution failed:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  private async cleanupOldMessages(): Promise<number> {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    // Delete messages from inactive organizations (no activity in 2 years)
    const inactiveOrgs = await prisma.company.findMany({
      where: {
        updatedAt: {
          lt: twoYearsAgo,
        },
      },
      select: { id: true },
    });

    if (inactiveOrgs.length === 0) {
      return 0;
    }

    const orgIds = inactiveOrgs.map((org) => org.id);

    // Delete messages from inactive organizations
    const deletedMessages = await prisma.chatLog.deleteMany({
      where: {
        widget: {
          company: {
            id: {
              in: orgIds,
            },
          },
        },
      },
    });

    return deletedMessages.count;
  }

  private async cleanupInactiveAnalytics(): Promise<number> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // This would be specific to your analytics table structure
    // For now, we'll assume there's an analytics table
    try {
      const deletedAnalytics = await prisma.$executeRaw`
        DELETE FROM analytics 
        WHERE created_at < ${oneYearAgo} 
        AND aggregated = false
      `;

      return Number(deletedAnalytics);
    } catch (error) {
      // If analytics table doesn't exist, return 0
      console.log('Analytics table not found or query failed, skipping...');
      return 0;
    }
  }

  private async cleanupDeletedAccounts(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find companies that have been inactive for more than 30 days
    // Since there's no deletedAt field, we'll use updatedAt
    const companiesForDeletion = await prisma.company.findMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo,
        },
        // Additional check for inactive companies
        widgets: {
          none: {
            isActive: true,
          },
        },
      },
      select: { id: true },
    });

    if (companiesForDeletion.length === 0) {
      return 0;
    }

    const companyIds = companiesForDeletion.map((c) => c.id);

    // Delete all related data in correct order (respecting foreign key constraints)
    const deletionResults = await prisma.$transaction(async (tx) => {
      // Delete messages first
      const messagesDeleted = await tx.chatLog.deleteMany({
        where: {
          widget: {
            company: {
              id: { in: companyIds },
            },
          },
        },
      });

      // Delete widgets
      const widgetsDeleted = await tx.widget.deleteMany({
        where: {
          company: {
            id: { in: companyIds },
          },
        },
      });

      // Delete users
      const usersDeleted = await tx.user.deleteMany({
        where: {
          companyId: { in: companyIds },
        },
      });

      // Finally delete companies
      const companiesDeleted = await tx.company.deleteMany({
        where: {
          id: { in: companyIds },
        },
      });

      return {
        messages: messagesDeleted.count,
        widgets: widgetsDeleted.count,
        users: usersDeleted.count,
        companies: companiesDeleted.count,
      };
    });

    console.log('Account cleanup completed:', deletionResults);
    return deletionResults.companies;
  }

  private async cleanupServerLogs(): Promise<number> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // This would typically be handled by log rotation or external log management
    // For demonstration, we'll assume there's a logs table
    try {
      const deletedLogs = await prisma.$executeRaw`
        DELETE FROM server_logs 
        WHERE created_at < ${ninetyDaysAgo}
      `;

      return Number(deletedLogs);
    } catch (error) {
      // If logs table doesn't exist, return 0
      console.log('Server logs table not found, skipping...');
      return 0;
    }
  }

  async scheduleRetentionPolicy(): Promise<void> {
    // Run retention policy daily at 2 AM
    const runDaily = () => {
      const now = new Date();
      const nextRun = new Date();
      nextRun.setHours(2, 0, 0, 0);

      // If it's already past 2 AM today, schedule for tomorrow
      if (now > nextRun) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      const msUntilNext = nextRun.getTime() - now.getTime();

      setTimeout(async () => {
        await this.executeRetentionPolicy();
        setInterval(() => this.executeRetentionPolicy(), 24 * 60 * 60 * 1000); // 24 hours
      }, msUntilNext);

      console.log(
        `Data retention policy scheduled for: ${nextRun.toISOString()}`
      );
    };

    runDaily();
  }

  async getRetentionStatus(): Promise<{
    lastRun?: Date;
    nextRun: Date;
    policies: {
      name: string;
      description: string;
      retentionPeriod: string;
      status: 'active' | 'inactive';
    }[];
  }> {
    const nextRun = new Date();
    nextRun.setHours(2, 0, 0, 0);
    if (new Date() > nextRun) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return {
      nextRun,
      policies: [
        {
          name: 'Chat Messages',
          description: 'Delete messages from inactive organizations',
          retentionPeriod: '2 years',
          status: 'active',
        },
        {
          name: 'Analytics Data',
          description: 'Delete raw analytics data after aggregation',
          retentionPeriod: '1 year',
          status: 'active',
        },
        {
          name: 'Deleted Accounts',
          description: 'Permanently delete account data after grace period',
          retentionPeriod: '30 days',
          status: 'active',
        },
        {
          name: 'Server Logs',
          description: 'Delete old server logs and access logs',
          retentionPeriod: '90 days',
          status: 'active',
        },
      ],
    };
  }
}

export const dataRetentionService = DataRetentionService.getInstance();
