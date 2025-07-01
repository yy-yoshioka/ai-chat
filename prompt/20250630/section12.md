# Section-12: System Health 設計書

**todo-key: `system-health`**

## 概要
システムの健康状態を監視し、メトリクス収集、SLAダッシュボード、OpenTelemetry Export機能を実装します。

## 実装範囲

### 1. Prisma Schema 追加
```prisma
model SystemMetric {
  id          String   @id @default(cuid())
  name        String   // "api_response_time", "db_connection_count", "memory_usage"
  value       Float
  unit        String   // "ms", "bytes", "count", "percentage"
  tags        Json?    // Additional metadata
  timestamp   DateTime @default(now())
  
  @@index([name])
  @@index([timestamp])
  @@map("system_metrics")
}

model HealthCheck {
  id          String   @id @default(cuid())
  service     String   // "database", "redis", "vector_db", "external_api"
  status      String   // "healthy", "degraded", "unhealthy"
  response_time Float?  // ms
  error       String?
  metadata    Json?
  checkedAt   DateTime @default(now())
  
  @@index([service])
  @@index([status])
  @@index([checkedAt])
  @@map("health_checks")
}

model Incident {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text
  severity    String   // "low", "medium", "high", "critical"
  status      String   // "investigating", "identified", "monitoring", "resolved"
  startedAt   DateTime @default(now())
  resolvedAt  DateTime?
  affectedServices String[] // Array of service names
  updates     IncidentUpdate[]
  
  @@index([status])
  @@index([severity])
  @@index([startedAt])
  @@map("incidents")
}

model IncidentUpdate {
  id          String   @id @default(cuid())
  incidentId  String
  message     String   @db.Text
  status      String
  createdAt   DateTime @default(now())
  
  incident    Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  
  @@index([incidentId])
  @@index([createdAt])
  @@map("incident_updates")
}
```

### 2. Health Monitoring Service (`src/services/healthMonitorService.ts`)
```typescript
import { logger } from '../lib/logger'
import { prisma } from '../lib/prisma'
import Redis from 'ioredis'
import axios from 'axios'

let instance: HealthMonitoringInstance | null = null
let redis: Redis
let monitoringInterval: NodeJS.Timeout | null = null

interface HealthMonitoringInstance {
  startMonitoring: (intervalMs?: number) => Promise<void>
  stopMonitoring: () => Promise<void>
  runHealthChecks: () => Promise<void>
  getSystemStatus: () => Promise<any>
}

export const getHealthMonitorInstance = (): HealthMonitoringInstance => {
  if (!instance) {
    redis = new Redis(process.env.REDIS_URL!)
    instance = {
      startMonitoring,
      stopMonitoring,
      runHealthChecks,
      getSystemStatus
    }
  }
  return instance
}

const startMonitoring = async (intervalMs: number = 30000) => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }

  monitoringInterval = setInterval(async () => {
    await runHealthChecks()
    await collectMetrics()
  }, intervalMs)

  logger.info('Health monitoring started', { intervalMs })
}

const stopMonitoring = async () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
  }
  logger.info('Health monitoring stopped')
}

const runHealthChecks = async () => {
  const checks = [
    checkDatabase(),
    checkRedis(),
    checkVectorDatabase(),
    checkExternalAPIs()
  ]

  await Promise.allSettled(checks)
}

const checkDatabase = async (): Promise<void> => {
  const startTime = Date.now()
  let status = 'healthy'
  let error: string | undefined

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (err: any) {
    status = 'unhealthy'
    error = err.message
    logger.error('Database health check failed', { error: err.message })
  }

  const responseTime = Date.now() - startTime

  await prisma.healthCheck.create({
    data: {
      service: 'database',
      status,
      response_time: responseTime,
      error,
      metadata: {
        connectionCount: await getDatabaseConnectionCount()
      }
    }
  })
}

const checkRedis = async (): Promise<void> => {
  const startTime = Date.now()
  let status = 'healthy'
  let error: string | undefined

  try {
    await redis.ping()
  } catch (err: any) {
    status = 'unhealthy'
    error = err.message
    logger.error('Redis health check failed', { error: err.message })
  }

  const responseTime = Date.now() - startTime

  await prisma.healthCheck.create({
    data: {
      service: 'redis',
      status,
      response_time: responseTime,
      error,
      metadata: {
        memory: await getRedisMemoryUsage()
      }
    }
  })
}

const checkVectorDatabase = async (): Promise<void> => {
  const startTime = Date.now()
  let status = 'healthy'
  let error: string | undefined

  try {
    // Pinecone health check example
    const response = await axios.get(`${process.env.PINECONE_ENVIRONMENT}/describe_index_stats`, {
      headers: {
        'Api-Key': process.env.PINECONE_API_KEY
      },
      timeout: 10000
    })
  } catch (err: any) {
    status = 'unhealthy'
    error = err.message
    logger.error('Vector database health check failed', { error: err.message })
  }

  const responseTime = Date.now() - startTime

  await prisma.healthCheck.create({
    data: {
      service: 'vector_db',
      status,
      response_time: responseTime,
      error
    }
  })
}

const checkExternalAPIs = async (): Promise<void> => {
  const apis = [
    { name: 'openai', url: 'https://api.openai.com/v1/models' },
    { name: 'stripe', url: 'https://api.stripe.com/v1/balance' }
  ]

  for (const api of apis) {
    const startTime = Date.now()
    let status = 'healthy'
    let error: string | undefined

    try {
      await axios.get(api.url, {
        headers: api.name === 'openai' 
          ? { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
          : { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
        timeout: 10000
      })
    } catch (err: any) {
      status = err.response?.status >= 500 ? 'unhealthy' : 'degraded'
      error = err.message
    }

    const responseTime = Date.now() - startTime

    await prisma.healthCheck.create({
      data: {
        service: `external_api_${api.name}`,
        status,
        response_time: responseTime,
        error
      }
    })
  }
}

const collectMetrics = async () => {
  const metrics = [
    await getMemoryUsage(),
    await getCPUUsage(),
    await getResponseTimeMetrics(),
    await getActiveConnectionCount()
  ]

  for (const metric of metrics) {
    await prisma.systemMetric.create({
      data: metric
    })
  }
}

const getMemoryUsage = async () => {
  const usage = process.memoryUsage()
  return {
    name: 'memory_usage',
    value: usage.rss,
    unit: 'bytes',
    tags: {
      type: 'rss',
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal
    }
  }
}

const getCPUUsage = async () => {
  const usage = process.cpuUsage()
  return {
    name: 'cpu_usage',
    value: (usage.user + usage.system) / 1000, // Convert to ms
    unit: 'ms',
    tags: {
      user: usage.user,
      system: usage.system
    }
  }
}

const getResponseTimeMetrics = async () => {
  // This would typically come from your request logging middleware
  const avgResponseTime = await calculateAverageResponseTime()
  return {
    name: 'api_response_time',
    value: avgResponseTime,
    unit: 'ms',
    tags: {
      period: '1m'
    }
  }
}

const getActiveConnectionCount = async () => {
  const count = await getDatabaseConnectionCount()
  return {
    name: 'db_connection_count',
    value: count,
    unit: 'count'
  }
}

const getDatabaseConnectionCount = async (): Promise<number> => {
  try {
    const result = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
    `
    return Number(result[0]?.count || 0)
  } catch {
    return 0
  }
}

const getRedisMemoryUsage = async (): Promise<number> => {
  try {
    const info = await redis.memory('USAGE')
    return Number(info)
  } catch {
    return 0
  }
}

const calculateAverageResponseTime = async (): Promise<number> => {
  // Implementation depends on your logging system
  // This is a placeholder
  return 100
}

const getSystemStatus = async () => {
  const recentChecks = await prisma.healthCheck.findMany({
    where: {
      checkedAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      }
    },
    orderBy: { checkedAt: 'desc' }
  })

  const serviceStatus = new Map<string, string>()
  
  for (const check of recentChecks) {
    if (!serviceStatus.has(check.service)) {
      serviceStatus.set(check.service, check.status)
    }
  }

  const overallStatus = Array.from(serviceStatus.values()).some(status => status === 'unhealthy')
    ? 'unhealthy'
    : Array.from(serviceStatus.values()).some(status => status === 'degraded')
    ? 'degraded'
    : 'healthy'

  return {
    overall: overallStatus,
    services: Object.fromEntries(serviceStatus),
    lastChecked: recentChecks[0]?.checkedAt || new Date()
  }
}
```

### 3. Express Routes (`src/routes/status.ts`)
```typescript
import express from 'express'
import { getHealthMonitorInstance } from '../services/healthMonitorService'
import { requireAuth } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { prisma } from '../lib/prisma'

const router = express.Router()
const healthMonitor = getHealthMonitorInstance()

// Public health endpoint
router.get('/health', async (req, res) => {
  const status = await healthMonitor.getSystemStatus()
  const statusCode = status.overall === 'healthy' ? 200 : 
                    status.overall === 'degraded' ? 200 : 503
  
  res.status(statusCode).json({
    status: status.overall,
    timestamp: new Date().toISOString(),
    services: status.services
  })
})

// Detailed metrics (admin only)
router.get('/metrics', requireAuth, requireAdmin, async (req, res) => {
  const timeRange = req.query.range as string || '1h'
  const startTime = new Date()
  
  switch (timeRange) {
    case '1h':
      startTime.setHours(startTime.getHours() - 1)
      break
    case '24h':
      startTime.setHours(startTime.getHours() - 24)
      break
    case '7d':
      startTime.setDate(startTime.getDate() - 7)
      break
  }

  const [metrics, healthChecks, incidents] = await Promise.all([
    prisma.systemMetric.findMany({
      where: {
        timestamp: { gte: startTime }
      },
      orderBy: { timestamp: 'desc' }
    }),
    prisma.healthCheck.findMany({
      where: {
        checkedAt: { gte: startTime }
      },
      orderBy: { checkedAt: 'desc' }
    }),
    prisma.incident.findMany({
      where: {
        startedAt: { gte: startTime }
      },
      include: {
        updates: true
      },
      orderBy: { startedAt: 'desc' }
    })
  ])

  // Calculate SLA metrics
  const totalChecks = healthChecks.length
  const healthyChecks = healthChecks.filter(check => check.status === 'healthy').length
  const uptime = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100

  const avgResponseTime = healthChecks.reduce((sum, check) => 
    sum + (check.response_time || 0), 0) / totalChecks

  res.json({
    sla: {
      uptime: uptime.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(2),
      totalIncidents: incidents.length
    },
    metrics: groupMetricsByName(metrics),
    recentIncidents: incidents.slice(0, 10),
    serviceHealth: await healthMonitor.getSystemStatus()
  })
})

// Incident management
router.post('/incidents', requireAuth, requireAdmin, async (req, res) => {
  const incident = await prisma.incident.create({
    data: req.body
  })
  res.status(201).json(incident)
})

router.put('/incidents/:id', requireAuth, requireAdmin, async (req, res) => {
  const incident = await prisma.incident.update({
    where: { id: req.params.id },
    data: req.body
  })
  res.json(incident)
})

router.post('/incidents/:id/updates', requireAuth, requireAdmin, async (req, res) => {
  const update = await prisma.incidentUpdate.create({
    data: {
      incidentId: req.params.id,
      ...req.body
    }
  })
  res.status(201).json(update)
})

const groupMetricsByName = (metrics: any[]) => {
  const grouped = new Map()
  
  for (const metric of metrics) {
    if (!grouped.has(metric.name)) {
      grouped.set(metric.name, [])
    }
    grouped.get(metric.name).push(metric)
  }
  
  return Object.fromEntries(grouped)
}

export default router
```

### 4. Metrics Middleware (`src/middleware/metrics.ts`)
```typescript
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()

  res.on('finish', async () => {
    const responseTime = Date.now() - startTime
    
    // Record API response time
    try {
      await prisma.systemMetric.create({
        data: {
          name: 'api_response_time',
          value: responseTime,
          unit: 'ms',
          tags: {
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode,
            endpoint: `${req.method} ${req.path}`
          }
        }
      })
    } catch (error) {
      // Don't let metrics recording crash the app
      console.error('Failed to record metrics:', error)
    }
  })

  next()
}
```

### 5. BFF Routes (`ai-chat-ui/app/api/bff/status/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { fetcher } from '../../../_utils/fetcher'
import { getSession } from '../../../_utils/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '1h'

    const metrics = await fetcher(`${process.env.API_URL}/status/metrics?range=${range}`, {
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    })

    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
```

### 6. Status Dashboard UI (`ai-chat-ui/app/_components/feature/status/`)

#### StatusDashboard.tsx
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useStatus } from '../../../_hooks/status/useStatus'
import { MetricsChart } from './MetricsChart'
import { ServiceStatusCard } from './ServiceStatusCard'
import { IncidentList } from './IncidentList'
import { SLAOverview } from './SLAOverview'

export function StatusDashboard() {
  const { metrics, isLoading, timeRange, setTimeRange } = useStatus()
  
  if (isLoading) {
    return <div className="animate-pulse">Loading system metrics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Health</h1>
          <p className="text-gray-600">Monitor system performance and incidents</p>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <SLAOverview sla={metrics?.sla} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(metrics?.serviceHealth?.services || {}).map(([service, status]) => (
          <ServiceStatusCard 
            key={service}
            service={service}
            status={status}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricsChart 
          title="Response Time"
          data={metrics?.metrics?.api_response_time || []}
          unit="ms"
        />
        <MetricsChart 
          title="Memory Usage"
          data={metrics?.metrics?.memory_usage || []}
          unit="MB"
        />
      </div>

      <IncidentList incidents={metrics?.recentIncidents || []} />
    </div>
  )
}
```

### 7. OpenTelemetry Integration (`src/lib/telemetry.ts`)
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'

export function initializeTelemetry() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'ai-chat-api',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics'
      }),
      exportIntervalMillis: 30000
    })
  })

  sdk.start()
  
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Telemetry terminated'))
      .catch((error) => console.log('Error terminating telemetry', error))
      .finally(() => process.exit(0))
  })
}
```

### 8. 自動アラート設定
```typescript
// src/services/alertService.ts
import { prisma } from '../lib/prisma'

export const checkThresholds = async () => {
  const recentMetrics = await prisma.systemMetric.findMany({
    where: {
      timestamp: {
        gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      }
    }
  })

  // Response time threshold check
  const avgResponseTime = calculateAverage(
    recentMetrics.filter(m => m.name === 'api_response_time')
  )
  
  if (avgResponseTime > 5000) { // 5 seconds
    await createIncident({
      title: 'High API Response Time',
      description: `Average response time is ${avgResponseTime}ms`,
      severity: 'high',
      affectedServices: ['api']
    })
  }

  // Memory usage threshold check
  const memoryUsage = getLatestValue(
    recentMetrics.filter(m => m.name === 'memory_usage')
  )
  
  if (memoryUsage > 1024 * 1024 * 1024) { // 1GB
    await createIncident({
      title: 'High Memory Usage',
      description: `Memory usage is ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      severity: 'medium',
      affectedServices: ['api']
    })
  }
}

const createIncident = async (data: any) => {
  // Check if similar incident already exists
  const existingIncident = await prisma.incident.findFirst({
    where: {
      title: data.title,
      status: { in: ['investigating', 'identified', 'monitoring'] }
    }
  })

  if (!existingIncident) {
    await prisma.incident.create({ data })
  }
}

const calculateAverage = (metrics: any[]): number => {
  if (metrics.length === 0) return 0
  const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
  return sum / metrics.length
}

const getLatestValue = (metrics: any[]): number => {
  if (metrics.length === 0) return 0
  return metrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].value
}
```

## 作業ステップ

1. **Prisma Schema更新**: SystemMetric, HealthCheck, Incident モデル追加
2. **Migration実行**: `yarn prisma migrate dev`
3. **HealthMonitorService実装**: 監視サービス作成
4. **Express Routes**: `/status` エンドポイント作成
5. **Metrics Middleware**: リクエスト計測ミドルウェア
6. **BFF Routes**: Status BFFルート
7. **Status Dashboard**: 管理画面UI作成
8. **OpenTelemetry設定**: テレメトリ初期化
9. **Alert Service**: 自動アラート機能
10. **Testing**: 監視機能・ダッシュボードテスト

## 成功指標

- システムメトリクスが正常に収集される
- ヘルスチェックが各サービスを監視
- SLAダッシュボードが稼働状況を表示
- インシデント管理機能が動作
- OpenTelemetryメトリクスがエクスポートされる
- アラートが適切にトリガーされる