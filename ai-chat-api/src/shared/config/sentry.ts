import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export interface AlertMetrics {
  responseTime: number;
  errorRate: number;
  timestamp: Date;
}

class MetricsCollector {
  private static instance: MetricsCollector;
  private responseTimeBuffer: number[] = [];
  private errorCount = 0;
  private requestCount = 0;
  private windowStartTime = Date.now();
  private readonly WINDOW_SIZE_MS = 60000; // 1 minute
  private readonly BUFFER_SIZE = 100;

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  recordResponseTime(responseTime: number) {
    this.responseTimeBuffer.push(responseTime);
    if (this.responseTimeBuffer.length > this.BUFFER_SIZE) {
      this.responseTimeBuffer.shift();
    }
    this.requestCount++;
    this.checkWindowReset();
  }

  recordError() {
    this.errorCount++;
    this.checkWindowReset();
  }

  private checkWindowReset() {
    const now = Date.now();
    if (now - this.windowStartTime >= this.WINDOW_SIZE_MS) {
      this.checkAlertConditions();
      this.resetWindow();
    }
  }

  private resetWindow() {
    this.errorCount = 0;
    this.requestCount = 0;
    this.windowStartTime = Date.now();
  }

  private checkAlertConditions() {
    const p95ResponseTime = this.calculateP95();
    const errorRate =
      this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    if (p95ResponseTime > 1000 || errorRate > 1) {
      this.sendSlackAlert({
        responseTime: p95ResponseTime,
        errorRate,
        timestamp: new Date(),
      });
    }
  }

  private calculateP95(): number {
    if (this.responseTimeBuffer.length === 0) return 0;

    const sorted = [...this.responseTimeBuffer].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[index] || 0;
  }

  private async sendSlackAlert(metrics: AlertMetrics) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('SLACK_WEBHOOK_URL not configured');
      return;
    }

    const message = {
      text: '🚨 Performance Alert',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*🚨 AI Chat Performance Alert*',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*P95 Response Time:*\n${metrics.responseTime.toFixed(2)}ms`,
            },
            {
              type: 'mrkdwn',
              text: `*Error Rate:*\n${metrics.errorRate.toFixed(2)}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${metrics.timestamp.toISOString()}`,
            },
            {
              type: 'mrkdwn',
              text: `*Environment:*\n${process.env.NODE_ENV || 'unknown'}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              metrics.responseTime > 1000
                ? '⚠️ P95 response time exceeded 1 second threshold'
                : '⚠️ Error rate exceeded 1% threshold',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Sentry Dashboard',
              },
              url: `https://sentry.io/organizations/${process.env.SENTRY_ORG}/projects/${process.env.SENTRY_PROJECT}/`,
              action_id: 'view_sentry',
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      console.log('Slack alert sent successfully');
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
      Sentry.captureException(error);
    }
  }

  getMetrics(): AlertMetrics {
    return {
      responseTime: this.calculateP95(),
      errorRate:
        this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      timestamp: new Date(),
    };
  }
}

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('SENTRY_DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration({ breadcrumbs: true }),
      Sentry.expressIntegration(),
      Sentry.mongooseIntegration(),
      Sentry.prismaIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Don't send events for handled errors in development
      if (process.env.NODE_ENV === 'development' && event.level === 'error') {
        console.error('Sentry event (dev):', event);
        return null;
      }
      return event;
    },
  });

  console.log('Sentry initialized');
}

export const metricsCollector = MetricsCollector.getInstance();
