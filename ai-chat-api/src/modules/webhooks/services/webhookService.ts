import { prisma } from '@shared/database/prisma';
import { Webhook, WebhookLog, Prisma } from '@prisma/client';
import crypto from 'crypto';
import { logger } from '@shared/logger';

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  organizationId: string;
}

export class WebhookService {
  private static instance: WebhookService;

  private constructor() {}

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  async createWebhook(
    organizationId: string,
    data: {
      name: string;
      url: string;
      events: string[];
      headers?: Record<string, string>;
      retryCount?: number;
      timeoutMs?: number;
    }
  ): Promise<Webhook> {
    const secret = crypto.randomBytes(32).toString('hex');

    return prisma.webhook.create({
      data: {
        name: data.name,
        url: data.url,
        secret,
        events: data.events,
        headers: data.headers || {},
        retryCount: data.retryCount || 3,
        timeoutMs: data.timeoutMs || 30000,
        organizationId,
      },
    });
  }

  async updateWebhook(
    id: string,
    organizationId: string,
    data: Partial<{
      name: string;
      url: string;
      events: string[];
      isActive: boolean;
      headers: Record<string, string>;
      retryCount: number;
      timeoutMs: number;
    }>
  ): Promise<Webhook> {
    // Verify ownership
    await this.verifyWebhookOwnership(id, organizationId);

    return prisma.webhook.update({
      where: { id },
      data,
    });
  }

  async deleteWebhook(id: string, organizationId: string): Promise<void> {
    await this.verifyWebhookOwnership(id, organizationId);
    await prisma.webhook.delete({ where: { id } });
  }

  async getWebhooks(organizationId: string): Promise<Webhook[]> {
    return prisma.webhook.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWebhook(id: string, organizationId: string): Promise<Webhook> {
    const webhook = await prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    return webhook;
  }

  async getWebhookLogs(
    webhookId: string,
    organizationId: string,
    filters?: {
      status?: string;
      event?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<WebhookLog[]> {
    await this.verifyWebhookOwnership(webhookId, organizationId);

    const where: {
      webhookId: string;
      status?: string;
      event?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = { webhookId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.event) {
      where.event = filters.event;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return prisma.webhookLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }

  async triggerWebhook(
    organizationId: string,
    event: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const webhooks = await prisma.webhook.findMany({
      where: {
        organizationId,
        isActive: true,
        events: { has: event },
      },
    });

    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      organizationId,
    };

    // Trigger webhooks asynchronously
    webhooks.forEach((webhook) => {
      this.sendWebhook(webhook, payload).catch((error) => {
        logger.error('Failed to send webhook', {
          webhookId: webhook.id,
          event,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    });
  }

  async testWebhook(
    webhookId: string,
    organizationId: string
  ): Promise<WebhookLog> {
    const webhook = await this.getWebhook(webhookId, organizationId);

    const testPayload: WebhookPayload = {
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook',
        webhookId,
      },
      timestamp: new Date().toISOString(),
      organizationId,
    };

    return this.sendWebhook(webhook, testPayload);
  }

  private async sendWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
    attempt: number = 1
  ): Promise<WebhookLog> {
    const log = await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: payload.event,
        payload: payload as unknown as Prisma.InputJsonValue,
        status: 'pending',
        attempts: attempt,
      },
    });

    try {
      const signature = this.generateSignature(payload, webhook.secret);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
        ...(webhook.headers as Record<string, string>),
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), webhook.timeoutMs);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseBody = await response.text();

      await prisma.webhookLog.update({
        where: { id: log.id },
        data: {
          status: response.ok ? 'success' : 'failed',
          statusCode: response.status,
          response: responseBody.substring(0, 5000), // Limit response size
          completedAt: new Date(),
        },
      });

      if (!response.ok && attempt < webhook.retryCount) {
        // Schedule retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          this.sendWebhook(webhook, payload, attempt + 1).catch((error) => {
            logger.error('Webhook retry failed', {
              webhookId: webhook.id,
              attempt: attempt + 1,
              error: error instanceof Error ? error.message : String(error),
            });
          });
        }, delay);
      }

      return prisma.webhookLog.findUniqueOrThrow({ where: { id: log.id } });
    } catch (error) {
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date(),
        },
      });

      if (attempt < webhook.retryCount) {
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          this.sendWebhook(webhook, payload, attempt + 1).catch((err) => {
            logger.error('Webhook retry failed', {
              webhookId: webhook.id,
              attempt: attempt + 1,
              error: err instanceof Error ? err.message : String(err),
            });
          });
        }, delay);
      }

      throw error;
    }
  }

  private generateSignature(payload: WebhookPayload, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  private async verifyWebhookOwnership(
    webhookId: string,
    organizationId: string
  ): Promise<void> {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, organizationId },
    });

    if (!webhook) {
      throw new Error('Webhook not found or access denied');
    }
  }
}

export const webhookService = WebhookService.getInstance();
