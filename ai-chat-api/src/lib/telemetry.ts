import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { logger } from './logger';

export function initializeTelemetry(): NodeSDK | null {
  try {
    const serviceName = process.env.OTEL_SERVICE_NAME || 'ai-chat-api';
    const metricsEndpoint = process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;

    if (!metricsEndpoint) {
      logger.info(
        'OpenTelemetry metrics endpoint not configured, skipping initialization'
      );
      return null;
    }

    // Create metric exporter
    const metricExporter = new OTLPMetricExporter({
      url: metricsEndpoint,
      headers: {},
    });

    // Create metric reader
    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000, // Export every minute
    });

    // Configure resource
    const resource = resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]:
        process.env.npm_package_version || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
        process.env.NODE_ENV || 'development',
    });

    // Initialize SDK
    const sdk = new NodeSDK({
      resource,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable fs instrumentation to reduce noise
          },
          '@opentelemetry/instrumentation-http': {
            requestHook: (span, request) => {
              // Add custom attributes to HTTP spans
              if ('url' in request && request.url) {
                span.setAttribute('http.url.path', request.url);
              }
            },
          },
          '@opentelemetry/instrumentation-express': {
            requestHook: (span, info) => {
              // Add custom attributes to Express spans
              if (info.request) {
                span.setAttribute(
                  'express.route',
                  (info as unknown as { layerPath?: string }).layerPath ||
                    'unknown'
                );
              }
            },
          },
        }),
      ],
      metricReader,
    });

    // Initialize the SDK
    sdk.start();

    logger.info('OpenTelemetry initialized', {
      serviceName,
      metricsEndpoint,
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .then(() => logger.info('OpenTelemetry terminated'))
        .catch((error) =>
          logger.error('Error shutting down OpenTelemetry', error)
        );
    });

    return sdk;
  } catch (error) {
    logger.error('Failed to initialize OpenTelemetry', error);
    return null;
  }
}

// Custom metrics helper
import { metrics, ValueType } from '@opentelemetry/api';

const meter = metrics.getMeter('ai-chat-api', '1.0.0');

// Create custom metrics
export const customMetrics = {
  // HTTP request duration histogram
  httpRequestDuration: meter.createHistogram('http_request_duration', {
    description: 'Duration of HTTP requests in milliseconds',
    unit: 'ms',
    valueType: ValueType.DOUBLE,
  }),

  // Active connections gauge
  activeConnections: meter.createUpDownCounter('active_connections', {
    description: 'Number of active connections',
    unit: '1',
    valueType: ValueType.INT,
  }),

  // Chat completion counter
  chatCompletions: meter.createCounter('chat_completions', {
    description: 'Number of chat completions',
    unit: '1',
    valueType: ValueType.INT,
  }),

  // Knowledge base operations counter
  knowledgeBaseOps: meter.createCounter('knowledge_base_operations', {
    description: 'Number of knowledge base operations',
    unit: '1',
    valueType: ValueType.INT,
  }),

  // Widget usage counter
  widgetUsage: meter.createCounter('widget_usage', {
    description: 'Number of widget interactions',
    unit: '1',
    valueType: ValueType.INT,
  }),

  // Error counter
  errors: meter.createCounter('errors', {
    description: 'Number of errors',
    unit: '1',
    valueType: ValueType.INT,
  }),
};

// Helper function to record metric with attributes
export function recordMetric(
  metric: {
    add?: (value: number, attributes?: Record<string, string | number>) => void;
    record?: (
      value: number,
      attributes?: Record<string, string | number>
    ) => void;
  },
  value: number,
  attributes?: Record<string, string | number>
): void {
  try {
    if ('add' in metric && metric.add) {
      metric.add(value, attributes);
    } else if ('record' in metric && metric.record) {
      metric.record(value, attributes);
    }
  } catch (error) {
    logger.error('Failed to record metric', {
      error,
      metric,
      value,
      attributes,
    });
  }
}
