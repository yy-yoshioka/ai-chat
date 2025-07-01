# Section-15: Data Retention Job 設計書

**todo-key: `data-retention`**

## 概要
古いデータの自動削除ジョブとデータ保持ポリシーの実装。GDPR準拠とパフォーマンス最適化を目的としたデータライフサイクル管理を構築します。

## 実装範囲

### 1. Prisma Schema追加

#### Data Retention Settings Model
```prisma
model DataRetentionPolicy {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Retention periods (in days)
  chatLogs       Int      @default(365)    // 1 year
  messageFeedback Int     @default(730)    // 2 years
  systemMetrics  Int      @default(90)     // 3 months
  webhookLogs    Int      @default(30)     // 1 month
  healthChecks   Int      @default(7)      // 1 week
  auditLogs      Int      @default(2555)   // 7 years (compliance)
  
  // Auto-deletion settings
  autoDelete     Boolean  @default(true)
  anonymizeData  Boolean  @default(false)  // Anonymize instead of delete
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([organizationId])
  @@map("data_retention_policies")
}

model DataRetentionJob {
  id             String   @id @default(cuid())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  jobType        String   // 'chat_logs', 'metrics', 'webhooks', etc.
  status         String   // 'pending', 'running', 'completed', 'failed'
  itemsProcessed Int      @default(0)
  itemsDeleted   Int      @default(0)
  itemsAnonymized Int     @default(0)
  
  startedAt      DateTime?
  completedAt    DateTime?
  error          String?
  metadata       Json?    // Additional job context
  
  createdAt      DateTime @default(now())
  
  @@index([organizationId])
  @@index([jobType])
  @@index([status])
  @@index([createdAt])
  @@map("data_retention_jobs")
}

// Organization model に以下を追加
model Organization {
  // ... existing fields
  dataRetentionPolicy DataRetentionPolicy?
  dataRetentionJobs   DataRetentionJob[]
}
```

### 2. Data Retention Service (`ai-chat-api/src/services/dataRetentionService.ts`)

```typescript
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

export interface RetentionPolicy {
  chatLogs: number
  messageFeedback: number
  systemMetrics: number
  webhookLogs: number
  healthChecks: number
  auditLogs: number
  autoDelete: boolean
  anonymizeData: boolean
}

export const getOrganizationRetentionPolicy = async (organizationId: string) => {
  let policy = await prisma.dataRetentionPolicy.findUnique({
    where: { organizationId }
  })

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
        anonymizeData: false
      }
    })
  }

  return policy
}

export const updateRetentionPolicy = async (
  organizationId: string,
  updates: Partial<RetentionPolicy>
) => {
  return prisma.dataRetentionPolicy.upsert({
    where: { organizationId },
    update: {
      ...updates,
      updatedAt: new Date()
    },
    create: {
      organizationId,
      ...updates
    }
  })
}

export const createRetentionJob = async (data: {
  organizationId?: string
  jobType: string
  metadata?: Record<string, any>
}) => {
  return prisma.dataRetentionJob.create({
    data: {
      ...data,
      status: 'pending'
    }
  })
}

export const updateRetentionJob = async (
  jobId: string,
  updates: {
    status?: string
    itemsProcessed?: number
    itemsDeleted?: number
    itemsAnonymized?: number
    startedAt?: Date
    completedAt?: Date
    error?: string
  }
) => {
  return prisma.dataRetentionJob.update({
    where: { id: jobId },
    data: updates
  })
}

// Chat logs cleanup
export const cleanupChatLogs = async (organizationId: string, retentionDays: number) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const job = await createRetentionJob({
    organizationId,
    jobType: 'chat_logs',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays }
  })

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date()
    })

    // Count items to be deleted
    const itemsToDelete = await prisma.chatLog.count({
      where: {
        widget: {
          company: {
            organizationId
          }
        },
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    // Delete chat logs and related feedback
    const deletedLogs = await prisma.chatLog.deleteMany({
      where: {
        widget: {
          company: {
            organizationId
          }
        },
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: itemsToDelete,
      itemsDeleted: deletedLogs.count,
      completedAt: new Date()
    })

    logger.info('Chat logs cleanup completed', {
      organizationId,
      deletedCount: deletedLogs.count,
      retentionDays
    })

    return deletedLogs.count

  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date()
    })
    
    logger.error('Chat logs cleanup failed', {
      organizationId,
      error: error instanceof Error ? error.message : error
    })
    
    throw error
  }
}

// System metrics cleanup
export const cleanupSystemMetrics = async (retentionDays: number) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const job = await createRetentionJob({
    jobType: 'system_metrics',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays }
  })

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date()
    })

    const itemsToDelete = await prisma.systemMetric.count({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    })

    const deletedMetrics = await prisma.systemMetric.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    })

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: itemsToDelete,
      itemsDeleted: deletedMetrics.count,
      completedAt: new Date()
    })

    logger.info('System metrics cleanup completed', {
      deletedCount: deletedMetrics.count,
      retentionDays
    })

    return deletedMetrics.count

  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date()
    })
    
    logger.error('System metrics cleanup failed', {
      error: error instanceof Error ? error.message : error
    })
    
    throw error
  }
}

// Webhook logs cleanup
export const cleanupWebhookLogs = async (organizationId: string, retentionDays: number) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const job = await createRetentionJob({
    organizationId,
    jobType: 'webhook_logs',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays }
  })

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date()
    })

    const itemsToDelete = await prisma.webhookLog.count({
      where: {
        webhook: {
          organizationId
        },
        executedAt: {
          lt: cutoffDate
        }
      }
    })

    const deletedLogs = await prisma.webhookLog.deleteMany({
      where: {
        webhook: {
          organizationId
        },
        executedAt: {
          lt: cutoffDate
        }
      }
    })

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: itemsToDelete,
      itemsDeleted: deletedLogs.count,
      completedAt: new Date()
    })

    logger.info('Webhook logs cleanup completed', {
      organizationId,
      deletedCount: deletedLogs.count,
      retentionDays
    })

    return deletedLogs.count

  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date()
    })
    
    logger.error('Webhook logs cleanup failed', {
      organizationId,
      error: error instanceof Error ? error.message : error
    })
    
    throw error
  }
}

// Health checks cleanup
export const cleanupHealthChecks = async (retentionDays: number) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const job = await createRetentionJob({
    jobType: 'health_checks',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays }
  })

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date()
    })

    const itemsToDelete = await prisma.healthCheck.count({
      where: {
        checkedAt: {
          lt: cutoffDate
        }
      }
    })

    const deletedChecks = await prisma.healthCheck.deleteMany({
      where: {
        checkedAt: {
          lt: cutoffDate
        }
      }
    })

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: itemsToDelete,
      itemsDeleted: deletedChecks.count,
      completedAt: new Date()
    })

    logger.info('Health checks cleanup completed', {
      deletedCount: deletedChecks.count,
      retentionDays
    })

    return deletedChecks.count

  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date()
    })
    
    logger.error('Health checks cleanup failed', {
      error: error instanceof Error ? error.message : error
    })
    
    throw error
  }
}

// Data anonymization (GDPR compliance)
export const anonymizeChatLogs = async (organizationId: string, retentionDays: number) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const job = await createRetentionJob({
    organizationId,
    jobType: 'chat_logs_anonymization',
    metadata: { cutoffDate: cutoffDate.toISOString(), retentionDays }
  })

  try {
    await updateRetentionJob(job.id, {
      status: 'running',
      startedAt: new Date()
    })

    // Find chat logs to anonymize
    const logsToAnonymize = await prisma.chatLog.findMany({
      where: {
        widget: {
          company: {
            organizationId
          }
        },
        createdAt: {
          lt: cutoffDate
        },
        userId: {
          not: null
        }
      },
      select: { id: true }
    })

    // Anonymize by removing user references and PII
    const anonymizedLogs = await prisma.chatLog.updateMany({
      where: {
        id: {
          in: logsToAnonymize.map(log => log.id)
        }
      },
      data: {
        userId: null,
        // Could add more anonymization logic here
      }
    })

    await updateRetentionJob(job.id, {
      status: 'completed',
      itemsProcessed: logsToAnonymize.length,
      itemsAnonymized: anonymizedLogs.count,
      completedAt: new Date()
    })

    logger.info('Chat logs anonymization completed', {
      organizationId,
      anonymizedCount: anonymizedLogs.count,
      retentionDays
    })

    return anonymizedLogs.count

  } catch (error) {
    await updateRetentionJob(job.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date()
    })
    
    logger.error('Chat logs anonymization failed', {
      organizationId,
      error: error instanceof Error ? error.message : error
    })
    
    throw error
  }
}

// Get retention job history
export const getRetentionJobHistory = async (
  organizationId?: string,
  limit: number = 50
) => {
  return prisma.dataRetentionJob.findMany({
    where: organizationId ? { organizationId } : {},
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: organizationId ? {} : {
      organization: {
        select: { name: true }
      }
    }
  })
}
```

### 3. Cron Job Implementation (`ai-chat-api/src/jobs/dataRetentionCron.ts`)

```typescript
import cron from 'node-cron'
import { logger } from '../lib/logger'
import { prisma } from '../lib/prisma'
import * as dataRetentionService from '../services/dataRetentionService'

export const startDataRetentionCron = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Starting daily data retention cleanup')
    
    try {
      // Get all organizations with auto-delete enabled
      const organizations = await prisma.organization.findMany({
        include: {
          dataRetentionPolicy: true
        }
      })

      for (const org of organizations) {
        const policy = org.dataRetentionPolicy || await dataRetentionService.getOrganizationRetentionPolicy(org.id)
        
        if (!policy.autoDelete) {
          logger.info(`Skipping retention for org ${org.id} - auto-delete disabled`)
          continue
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
          ])

          logger.info(`Completed retention cleanup for organization ${org.id}`)

        } catch (error) {
          logger.error(`Failed retention cleanup for organization ${org.id}`, {
            error: error instanceof Error ? error.message : error
          })
        }
      }

      // Global cleanup (not organization-specific)
      await Promise.allSettled([
        dataRetentionService.cleanupSystemMetrics(90), // 3 months default
        dataRetentionService.cleanupHealthChecks(7),   // 1 week default
      ])

      logger.info('Daily data retention cleanup completed')

    } catch (error) {
      logger.error('Data retention cron job failed', {
        error: error instanceof Error ? error.message : error
      })
    }
  })

  // Run weekly cleanup on Sundays at 3 AM for more intensive operations
  cron.schedule('0 3 * * 0', async () => {
    logger.info('Starting weekly data retention maintenance')
    
    try {
      // Vacuum and analyze database
      await prisma.$executeRaw`VACUUM ANALYZE`
      
      // Clean up orphaned records
      await cleanupOrphanedRecords()
      
      logger.info('Weekly data retention maintenance completed')
      
    } catch (error) {
      logger.error('Weekly data retention maintenance failed', {
        error: error instanceof Error ? error.message : error
      })
    }
  })

  logger.info('Data retention cron jobs started')
}

const cleanupOrphanedRecords = async () => {
  // Clean up webhook logs without webhooks
  const orphanedWebhookLogs = await prisma.webhookLog.deleteMany({
    where: {
      webhook: null
    }
  })

  // Clean up message feedback without chat logs
  const orphanedFeedback = await prisma.messageFeedback.deleteMany({
    where: {
      chatLog: null
    }
  })

  logger.info('Orphaned records cleanup completed', {
    webhookLogs: orphanedWebhookLogs.count,
    messageFeedback: orphanedFeedback.count
  })
}
```

### 4. Express Routes (`ai-chat-api/src/routes/dataRetention.ts`)

```typescript
import express from 'express'
import { requireAuth } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { requireOrgAccess } from '../middleware/organizationAccess'
import * as dataRetentionService from '../services/dataRetentionService'

const router = express.Router()

// Get retention policy
router.get('/policy', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const policy = await dataRetentionService.getOrganizationRetentionPolicy(req.organizationId!)
    res.json(policy)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch retention policy' })
  }
})

// Update retention policy
router.put('/policy', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const policy = await dataRetentionService.updateRetentionPolicy(
      req.organizationId!,
      req.body
    )
    res.json(policy)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update retention policy' })
  }
})

// Manual cleanup trigger
router.post('/cleanup', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const { dataType } = req.body
    const policy = await dataRetentionService.getOrganizationRetentionPolicy(req.organizationId!)
    
    let result
    switch (dataType) {
      case 'chat_logs':
        result = policy.anonymizeData 
          ? await dataRetentionService.anonymizeChatLogs(req.organizationId!, policy.chatLogs)
          : await dataRetentionService.cleanupChatLogs(req.organizationId!, policy.chatLogs)
        break
      case 'webhook_logs':
        result = await dataRetentionService.cleanupWebhookLogs(req.organizationId!, policy.webhookLogs)
        break
      default:
        return res.status(400).json({ error: 'Invalid data type' })
    }
    
    res.json({ 
      message: 'Cleanup completed',
      itemsProcessed: result
    })
  } catch (error) {
    res.status(500).json({ error: 'Cleanup failed' })
  }
})

// Get job history
router.get('/jobs', requireAuth, requireOrgAccess, async (req, res) => {
  try {
    const jobs = await dataRetentionService.getRetentionJobHistory(
      req.organizationId!,
      parseInt(req.query.limit as string) || 50
    )
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job history' })
  }
})

// Admin-only global operations
router.get('/jobs/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const jobs = await dataRetentionService.getRetentionJobHistory(
      undefined,
      parseInt(req.query.limit as string) || 100
    )
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global job history' })
  }
})

router.post('/cleanup/global', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { dataType, retentionDays } = req.body
    
    let result
    switch (dataType) {
      case 'system_metrics':
        result = await dataRetentionService.cleanupSystemMetrics(retentionDays || 90)
        break
      case 'health_checks':
        result = await dataRetentionService.cleanupHealthChecks(retentionDays || 7)
        break
      default:
        return res.status(400).json({ error: 'Invalid data type' })
    }
    
    res.json({ 
      message: 'Global cleanup completed',
      itemsProcessed: result
    })
  } catch (error) {
    res.status(500).json({ error: 'Global cleanup failed' })
  }
})

export default router
```

### 5. Frontend Components

#### Data Retention Settings Page (`ai-chat-ui/app/(org)/admin/[orgId]/settings/data-retention/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/_components/common/PageHeader'
import { DataRetentionSettings } from '@/_components/feature/settings/DataRetentionSettings'
import { RetentionJobHistory } from '@/_components/feature/settings/RetentionJobHistory'

export default function DataRetentionPage() {
  const params = useParams()
  const orgId = params.orgId as string
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="データ保持設定"
        description="データの自動削除とプライバシー管理"
      />
      
      <DataRetentionSettings orgId={orgId} />
      <RetentionJobHistory orgId={orgId} />
    </div>
  )
}
```

#### Data Retention Settings Component

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useDataRetention } from '@/_hooks/settings/useDataRetention'

interface DataRetentionSettingsProps {
  orgId: string
}

export function DataRetentionSettings({ orgId }: DataRetentionSettingsProps) {
  const { policy, isLoading, updatePolicy, triggerCleanup } = useDataRetention(orgId)
  const [localPolicy, setLocalPolicy] = useState(policy || {})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePolicy(localPolicy)
      toast({
        title: '設定を保存しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: '設定の保存に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleManualCleanup = async (dataType: string) => {
    try {
      await triggerCleanup(dataType)
      toast({
        title: 'クリーンアップを開始しました',
        description: 'バックグラウンドで処理が実行されています',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'クリーンアップの開始に失敗しました',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const retentionItems = [
    { key: 'chatLogs', label: 'チャットログ', description: 'ユーザーとの会話履歴', defaultDays: 365 },
    { key: 'messageFeedback', label: 'メッセージフィードバック', description: 'ユーザーからの評価データ', defaultDays: 730 },
    { key: 'webhookLogs', label: 'Webhookログ', description: 'Webhook実行履歴', defaultDays: 30 },
    { key: 'systemMetrics', label: 'システムメトリクス', description: 'パフォーマンス指標', defaultDays: 90 },
    { key: 'healthChecks', label: 'ヘルスチェック', description: 'システム監視データ', defaultDays: 7 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          データ保持ポリシー
          <Button onClick={handleSave} disabled={isSaving}>
            保存
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-2">
            <Switch
              checked={localPolicy.autoDelete || false}
              onCheckedChange={(checked) => 
                setLocalPolicy(prev => ({ ...prev, autoDelete: checked }))
              }
            />
            <span>自動削除を有効化</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch
              checked={localPolicy.anonymizeData || false}
              onCheckedChange={(checked) => 
                setLocalPolicy(prev => ({ ...prev, anonymizeData: checked }))
              }
            />
            <span>削除の代わりに匿名化</span>
          </label>
        </div>

        {/* Retention Periods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">保持期間設定</h3>
          {retentionItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="9999"
                    className="w-20"
                    value={localPolicy[item.key] || item.defaultDays}
                    onChange={(e) => 
                      setLocalPolicy(prev => ({
                        ...prev,
                        [item.key]: parseInt(e.target.value) || item.defaultDays
                      }))
                    }
                  />
                  <span className="text-sm">日</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManualCleanup(item.key)}
                >
                  今すぐ実行
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">コンプライアンス情報</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• GDPR: 個人データは必要最小限の期間のみ保持</li>
            <li>• 匿名化: 個人を特定できない形でデータを保持</li>
            <li>• 監査ログ: 法的要件により7年間保持</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 6. Hooks Implementation

```typescript
// ai-chat-ui/app/_hooks/settings/useDataRetention.ts
'use client'

import { useState, useEffect } from 'react'
import { fetcher } from '../../_utils/fetcher'

export const useDataRetention = (orgId: string) => {
  const [policy, setPolicy] = useState(null)
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPolicy = async () => {
    try {
      const data = await fetcher('/api/bff/data-retention/policy')
      setPolicy(data)
    } catch (error) {
      console.error('Failed to fetch retention policy:', error)
    }
  }

  const fetchJobs = async () => {
    try {
      const data = await fetcher('/api/bff/data-retention/jobs')
      setJobs(data)
    } catch (error) {
      console.error('Failed to fetch retention jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePolicy = async (newPolicy: any) => {
    const updated = await fetcher('/api/bff/data-retention/policy', {
      method: 'PUT',
      body: JSON.stringify(newPolicy)
    })
    setPolicy(updated)
    return updated
  }

  const triggerCleanup = async (dataType: string) => {
    return fetcher('/api/bff/data-retention/cleanup', {
      method: 'POST',
      body: JSON.stringify({ dataType })
    })
  }

  useEffect(() => {
    Promise.all([fetchPolicy(), fetchJobs()])
  }, [orgId])

  return {
    policy,
    jobs,
    isLoading,
    updatePolicy,
    triggerCleanup,
    refetch: () => Promise.all([fetchPolicy(), fetchJobs()])
  }
}
```

### 7. BFF Routes

```typescript
// ai-chat-ui/app/api/bff/data-retention/policy/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { fetcher } from '../../../../_utils/fetcher'
import { getSession } from '../../../../_utils/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const policy = await fetcher(`${process.env.API_URL}/data-retention/policy`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'X-Organization-Id': session.organizationId
      }
    })

    return NextResponse.json(policy)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch policy' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const policy = await fetcher(`${process.env.API_URL}/data-retention/policy`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'X-Organization-Id': session.organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    return NextResponse.json(policy)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 })
  }
}
```

## 作業ステップ

1. **Prisma Schema更新**: データ保持ポリシーとジョブモデル追加
2. **Migration実行**: `yarn prisma migrate dev`
3. **Data Retention Service実装**: データクリーンアップロジック
4. **Cron Job設定**: 定期実行ジョブ
5. **Express Routes**: API エンドポイント
6. **BFF Routes**: プロキシAPI
7. **Frontend Components**: 設定画面とジョブ履歴
8. **Hooks実装**: データ管理ロジック
9. **Testing**: クリーンアップ機能テスト
10. **Documentation**: 運用手順書作成

## 成功指標

- データ保持ポリシーが組織ごとに設定可能
- 自動削除ジョブが定期実行される
- 手動クリーンアップが管理画面から実行可能
- ジョブ履歴が適切に記録・表示される
- GDPR準拠の匿名化機能が動作
- パフォーマンスが改善される（古いデータ削除により）