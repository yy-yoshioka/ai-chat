import { z } from 'zod';

// Health status
export const healthStatusEnum = z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']);

// Service status
export const serviceStatusSchema = z.object({
  name: z.string(),
  status: healthStatusEnum,
  responseTime: z.number().nonnegative().optional(),
  lastChecked: z.string().datetime(),
  error: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// System metrics
export const systemMetricsSchema = z.object({
  cpu: z.object({
    usage: z.number().min(0).max(100),
    cores: z.number().int().positive(),
    loadAverage: z.array(z.number().nonnegative()).length(3),
  }),
  memory: z.object({
    total: z.number().int().positive(),
    used: z.number().int().nonnegative(),
    free: z.number().int().nonnegative(),
    percentage: z.number().min(0).max(100),
  }),
  disk: z.object({
    total: z.number().int().positive(),
    used: z.number().int().nonnegative(),
    free: z.number().int().nonnegative(),
    percentage: z.number().min(0).max(100),
  }),
  network: z.object({
    in: z.number().int().nonnegative(),
    out: z.number().int().nonnegative(),
    connections: z.number().int().nonnegative(),
  }),
  uptime: z.number().int().nonnegative(),
});

// Database health
export const databaseHealthSchema = z.object({
  status: healthStatusEnum,
  connections: z.object({
    active: z.number().int().nonnegative(),
    idle: z.number().int().nonnegative(),
    max: z.number().int().positive(),
  }),
  responseTime: z.number().nonnegative(),
  replicationLag: z.number().nonnegative().optional(),
  lastBackup: z.string().datetime().optional(),
});

// Cache health
export const cacheHealthSchema = z.object({
  status: healthStatusEnum,
  hitRate: z.number().min(0).max(100),
  memory: z.object({
    used: z.number().int().nonnegative(),
    max: z.number().int().positive(),
  }),
  evictions: z.number().int().nonnegative(),
  connections: z.number().int().nonnegative(),
});

// Queue health
export const queueHealthSchema = z.object({
  status: healthStatusEnum,
  pending: z.number().int().nonnegative(),
  processing: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  latency: z.number().nonnegative(),
});

// External service health
export const externalServiceHealthSchema = z.object({
  openai: serviceStatusSchema,
  qdrant: serviceStatusSchema,
  stripe: serviceStatusSchema.optional(),
  sendgrid: serviceStatusSchema.optional(),
  s3: serviceStatusSchema.optional(),
});

// Health check response
export const healthCheckResponseSchema = z.object({
  status: healthStatusEnum,
  timestamp: z.string().datetime(),
  version: z.string(),
  environment: z.string(),
  services: z.object({
    api: serviceStatusSchema,
    database: databaseHealthSchema,
    cache: cacheHealthSchema,
    queue: queueHealthSchema,
    external: externalServiceHealthSchema,
  }),
  metrics: systemMetricsSchema,
  checks: z.array(
    z.object({
      name: z.string(),
      status: healthStatusEnum,
      duration: z.number().nonnegative(),
      message: z.string().optional(),
    })
  ),
});

// Performance metrics
export const performanceMetricsSchema = z.object({
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  api: z.object({
    totalRequests: z.number().int().nonnegative(),
    averageResponseTime: z.number().nonnegative(),
    p95ResponseTime: z.number().nonnegative(),
    p99ResponseTime: z.number().nonnegative(),
    errorRate: z.number().min(0).max(100),
    requestsPerSecond: z.number().nonnegative(),
  }),
  database: z.object({
    queryCount: z.number().int().nonnegative(),
    averageQueryTime: z.number().nonnegative(),
    slowQueries: z.number().int().nonnegative(),
    connectionPoolUtilization: z.number().min(0).max(100),
  }),
  cache: z.object({
    operations: z.number().int().nonnegative(),
    hitRate: z.number().min(0).max(100),
    missRate: z.number().min(0).max(100),
    averageLatency: z.number().nonnegative(),
  }),
});

// Alert schema
export const systemAlertSchema = z.object({
  id: z.string(),
  type: z.enum(['cpu', 'memory', 'disk', 'network', 'service', 'error_rate', 'response_time']),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  message: z.string(),
  metric: z.string(),
  threshold: z.number(),
  value: z.number(),
  timestamp: z.string().datetime(),
  resolved: z.boolean().default(false),
  resolvedAt: z.string().datetime().optional(),
});

// System health summary
export const systemHealthSummarySchema = z.object({
  overallStatus: healthStatusEnum,
  healthScore: z.number().min(0).max(100),
  activeAlerts: z.number().int().nonnegative(),
  criticalIssues: z.number().int().nonnegative(),
  lastIncident: z.string().datetime().optional(),
  recommendations: z.array(z.string()).optional(),
});

// Incident schemas for our implementation
export const incidentSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const incidentStatusSchema = z.enum(['investigating', 'identified', 'monitoring', 'resolved']);

export const incidentUpdateSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  status: z.string(),
  message: z.string(),
  createdBy: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const incidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: incidentSeveritySchema,
  status: incidentStatusSchema,
  affectedServices: z.array(z.string()),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  updates: z.array(incidentUpdateSchema).optional(),
});

export const createIncidentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  severity: incidentSeveritySchema,
  affectedServices: z.array(z.string()).min(1),
});

export const updateIncidentSchema = z.object({
  status: incidentStatusSchema,
  message: z.string().min(1),
});

// Public status schema
export const publicStatusSchema = z.object({
  status: z.record(z.object({
    status: healthStatusEnum,
    message: z.string().optional(),
  })),
  incidents: z.array(z.object({
    id: z.string(),
    title: z.string(),
    severity: incidentSeveritySchema,
    status: incidentStatusSchema,
    affectedServices: z.array(z.string()),
    createdAt: z.string().datetime(),
    updates: z.array(z.object({
      status: z.string(),
      message: z.string(),
      createdAt: z.string().datetime(),
    })).optional(),
  })),
  sla: z.object({
    uptime: z.number(),
    avgResponseTime: z.number(),
    period: z.string(),
  }),
  lastUpdated: z.string().datetime(),
});

// System metric schema for database
export const systemMetricSchema = z.object({
  id: z.string(),
  service: z.string(),
  metricType: z.string(),
  value: z.number(),
  unit: z.string(),
  metadata: z.any().optional(),
  timestamp: z.string().datetime(),
});

// Type exports
export type HealthStatus = z.infer<typeof healthStatusEnum>;
export type ServiceStatus = z.infer<typeof serviceStatusSchema>;
export type SystemMetrics = z.infer<typeof systemMetricsSchema>;
export type DatabaseHealth = z.infer<typeof databaseHealthSchema>;
export type CacheHealth = z.infer<typeof cacheHealthSchema>;
export type QueueHealth = z.infer<typeof queueHealthSchema>;
export type ExternalServiceHealth = z.infer<typeof externalServiceHealthSchema>;
export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
export type PerformanceMetrics = z.infer<typeof performanceMetricsSchema>;
export type SystemAlert = z.infer<typeof systemAlertSchema>;
export type SystemHealthSummary = z.infer<typeof systemHealthSummarySchema>;
export type Incident = z.infer<typeof incidentSchema>;
export type IncidentUpdate = z.infer<typeof incidentUpdateSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type PublicStatus = z.infer<typeof publicStatusSchema>;
export type SystemMetric = z.infer<typeof systemMetricSchema>;
