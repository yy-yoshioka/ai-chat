# Section-11: Webhook Suite 設計書

**todo-key: `webhook-suite`**

## 概要
Webhook機能の完全な実装。外部システムとの連携を可能にし、イベント駆動型の通知システムを構築します。

## 実装範囲

### 1. Prisma Schema 追加
```prisma
model Webhook {
  id          String   @id @default(cuid())
  name        String
  url         String
  events      String[] // ["message.created", "user.registered", "chat.completed"]
  isActive    Boolean  @default(true)
  secret      String?  // HMAC署名用
  headers     Json?    // カスタムヘッダー
  retryCount  Int      @default(3)
  timeout     Int      @default(30000) // ms
  organizationId String
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  logs WebhookLog[]
  
  @@index([organizationId])
  @@index([isActive])
  @@map("webhooks")
}

model WebhookLog {
  id          String   @id @default(cuid())
  webhookId   String
  event       String
  payload     Json
  response    Json?
  status      String   // "success", "failed", "pending", "retrying"
  statusCode  Int?
  error       String?
  attempt     Int      @default(1)
  executedAt  DateTime @default(now())
  
  webhook Webhook @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  
  @@index([webhookId])
  @@index([status])
  @@index([executedAt])
  @@map("webhook_logs")
}
```

### 2. Express API Routes (`src/routes/webhooks.ts`)
```typescript
import express from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import { requireOrgAccess } from '../middleware/organizationAccess'
import { WebhookService } from '../services/webhookService'

const router = express.Router()

// Webhook CRUD
router.get('/', requireAuth, requireOrgAccess, async (req, res) => {
  const webhooks = await WebhookService.listByOrganization(req.organizationId!)
  res.json(webhooks)
})

router.post('/', requireAuth, requireOrgAccess, async (req, res) => {
  const webhook = await WebhookService.create({
    ...req.body,
    organizationId: req.organizationId!
  })
  res.status(201).json(webhook)
})

router.put('/:id', requireAuth, requireOrgAccess, async (req, res) => {
  const webhook = await WebhookService.update(req.params.id, req.body)
  res.json(webhook)
})

router.delete('/:id', requireAuth, requireOrgAccess, async (req, res) => {
  await WebhookService.delete(req.params.id)
  res.status(204).send()
})

// Webhook logs
router.get('/:id/logs', requireAuth, requireOrgAccess, async (req, res) => {
  const logs = await WebhookService.getLogs(req.params.id, {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 50
  })
  res.json(logs)
})

// Test webhook
router.post('/:id/test', requireAuth, requireOrgAccess, async (req, res) => {
  const result = await WebhookService.test(req.params.id)
  res.json(result)
})

export default router
```

### 3. WebhookService (`src/services/webhookService.ts`)
```typescript
import { PrismaClient, Webhook } from '@prisma/client'
import axios from 'axios'
import crypto from 'crypto'
import { logger } from '../lib/logger'

const prisma = new PrismaClient()

export class WebhookService {
  static async create(data: {
    name: string
    url: string
    events: string[]
    organizationId: string
    secret?: string
    headers?: Record<string, string>
    retryCount?: number
    timeout?: number
  }) {
    return prisma.webhook.create({
      data: {
        ...data,
        secret: data.secret || crypto.randomBytes(32).toString('hex')
      }
    })
  }

  static async listByOrganization(organizationId: string) {
    return prisma.webhook.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { logs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async update(id: string, data: Partial<Webhook>) {
    return prisma.webhook.update({
      where: { id },
      data
    })
  }

  static async delete(id: string) {
    return prisma.webhook.delete({
      where: { id }
    })
  }

  static async getLogs(webhookId: string, options: { page: number; limit: number }) {
    const { page, limit } = options
    const offset = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.webhookLog.findMany({
        where: { webhookId },
        orderBy: { executedAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.webhookLog.count({
        where: { webhookId }
      })
    ])

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async test(webhookId: string) {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId }
    })

    if (!webhook) {
      throw new Error('Webhook not found')
    }

    const testPayload = {
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook',
        timestamp: new Date().toISOString()
      }
    }

    return this.trigger(webhook, 'webhook.test', testPayload)
  }

  static async trigger(webhook: Webhook, event: string, payload: any) {
    if (!webhook.isActive || !webhook.events.includes(event)) {
      return null
    }

    const logId = crypto.randomUUID()
    let attempt = 1

    while (attempt <= webhook.retryCount) {
      try {
        const signature = this.generateSignature(payload, webhook.secret!)
        
        const response = await axios.post(webhook.url, payload, {
          timeout: webhook.timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
            'User-Agent': 'AI-Chat-Webhook/1.0',
            ...webhook.headers
          }
        })

        await prisma.webhookLog.create({
          data: {
            id: logId,
            webhookId: webhook.id,
            event,
            payload,
            response: {
              status: response.status,
              headers: response.headers,
              data: response.data
            },
            status: 'success',
            statusCode: response.status,
            attempt,
            executedAt: new Date()
          }
        })

        return { success: true, status: response.status }

      } catch (error: any) {
        const isLastAttempt = attempt === webhook.retryCount

        await prisma.webhookLog.create({
          data: {
            id: logId,
            webhookId: webhook.id,
            event,
            payload,
            status: isLastAttempt ? 'failed' : 'retrying',
            statusCode: error.response?.status,
            error: error.message,
            attempt,
            executedAt: new Date()
          }
        })

        if (isLastAttempt) {
          logger.error('Webhook failed after all retries', {
            webhookId: webhook.id,
            event,
            error: error.message
          })
          return { success: false, error: error.message }
        }

        attempt++
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
      }
    }
  }

  private static generateSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(JSON.stringify(payload))
    return `sha256=${hmac.digest('hex')}`
  }
}
```

### 4. BFF Routes (`ai-chat-ui/app/api/bff/webhooks/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { fetcher } from '../../../_utils/fetcher'
import { getSession } from '../../../_utils/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const webhooks = await fetcher(`${process.env.API_URL}/webhooks`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'X-Organization-Id': session.organizationId
      }
    })

    return NextResponse.json(webhooks)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const webhook = await fetcher(`${process.env.API_URL}/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'X-Organization-Id': session.organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    return NextResponse.json(webhook, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })
  }
}
```

### 5. Webhook管理UI (`ai-chat-ui/app/_components/feature/webhooks/`)

#### WebhooksList.tsx
```typescript
'use client'

import { useState } from 'react'
import { useWebhooks } from '../../../_hooks/webhooks/useWebhooks'
import { WebhookCard } from './WebhookCard'
import { CreateWebhookModal } from './CreateWebhookModal'
import { Button } from '../../ui/Button'

export function WebhooksList() {
  const { webhooks, isLoading, createWebhook, updateWebhook, deleteWebhook } = useWebhooks()
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (isLoading) {
    return <div className="animate-pulse">Loading webhooks...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-gray-600">Manage webhook endpoints for external integrations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No webhooks configured</h3>
          <p className="text-gray-600 mb-4">
            Create your first webhook to start receiving event notifications
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Your First Webhook
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              onUpdate={updateWebhook}
              onDelete={deleteWebhook}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateWebhookModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createWebhook}
        />
      )}
    </div>
  )
}
```

### 6. useWebhooks Hook (`ai-chat-ui/app/_hooks/webhooks/useWebhooks.ts`)
```typescript
'use client'

import { useState, useEffect } from 'react'
import { fetcher } from '../../_utils/fetcher'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  secret?: string
  headers?: Record<string, string>
  retryCount: number
  timeout: number
  createdAt: string
  updatedAt: string
  _count: {
    logs: number
  }
}

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const data = await fetcher('/api/bff/webhooks')
      setWebhooks(data)
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createWebhook = async (data: {
    name: string
    url: string
    events: string[]
    secret?: string
    headers?: Record<string, string>
    retryCount?: number
    timeout?: number
  }) => {
    try {
      const webhook = await fetcher('/api/bff/webhooks', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      setWebhooks(prev => [...prev, webhook])
      return webhook
    } catch (error) {
      console.error('Failed to create webhook:', error)
      throw error
    }
  }

  const updateWebhook = async (id: string, data: Partial<Webhook>) => {
    try {
      const webhook = await fetcher(`/api/bff/webhooks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      setWebhooks(prev => prev.map(w => w.id === id ? webhook : w))
      return webhook
    } catch (error) {
      console.error('Failed to update webhook:', error)
      throw error
    }
  }

  const deleteWebhook = async (id: string) => {
    try {
      await fetcher(`/api/bff/webhooks/${id}`, {
        method: 'DELETE'
      })
      setWebhooks(prev => prev.filter(w => w.id !== id))
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      throw error
    }
  }

  return {
    webhooks,
    isLoading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    refetch: fetchWebhooks
  }
}
```

### 7. Zod Schemas (`ai-chat-ui/app/_schemas/webhooks.ts`)
```typescript
import { z } from 'zod'

export const WebhookEventTypes = [
  'message.created',
  'message.feedback',
  'user.registered',
  'chat.completed',
  'knowledge_base.updated',
  'faq.created',
  'widget.installed'
] as const

export const CreateWebhookSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.enum(WebhookEventTypes)).min(1, 'At least one event must be selected'),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
  retryCount: z.number().min(1).max(5).default(3),
  timeout: z.number().min(1000).max(60000).default(30000)
})

export const UpdateWebhookSchema = CreateWebhookSchema.partial()

export const WebhookLogSchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  event: z.string(),
  payload: z.any(),
  response: z.any().optional(),
  status: z.enum(['success', 'failed', 'pending', 'retrying']),
  statusCode: z.number().optional(),
  error: z.string().optional(),
  attempt: z.number(),
  executedAt: z.string()
})

export type CreateWebhookInput = z.infer<typeof CreateWebhookSchema>
export type UpdateWebhookInput = z.infer<typeof UpdateWebhookSchema>
export type WebhookLog = z.infer<typeof WebhookLogSchema>
```

### 8. Webhook Trigger Integration

チャットメッセージ作成時にWebhookをトリガーする例:
```typescript
// src/routes/chat.ts内で
import { WebhookService } from '../services/webhookService'

// メッセージ作成後
const webhooks = await prisma.webhook.findMany({
  where: {
    organizationId: req.organizationId,
    isActive: true,
    events: {
      has: 'message.created'
    }
  }
})

webhooks.forEach(webhook => {
  WebhookService.trigger(webhook, 'message.created', {
    event: 'message.created',
    data: {
      chatLogId: chatLog.id,
      question: chatLog.question,
      answer: chatLog.answer,
      userId: chatLog.userId,
      widgetId: chatLog.widgetId,
      timestamp: chatLog.createdAt
    }
  }).catch(error => {
    logger.error('Webhook trigger failed', { error, webhookId: webhook.id })
  })
})
```

## 作業ステップ

1. **Prisma Schema更新**: WebhookとWebhookLogモデル追加
2. **Migration実行**: `yarn prisma migrate dev`
3. **Express Routes作成**: `src/routes/webhooks.ts`
4. **WebhookService実装**: `src/services/webhookService.ts`
5. **BFF Routes作成**: `ai-chat-ui/app/api/bff/webhooks/`
6. **UI Components作成**: Webhook管理画面
7. **Hooks実装**: `useWebhooks.ts`
8. **Schemas追加**: Zod validation schemas
9. **Integration**: 既存のイベントでWebhook trigger
10. **Testing**: Webhook作成・更新・削除・ログ確認

## 成功指標

- Webhook CRUD操作が正常に動作
- ログ表示とテスト機能が動作
- イベント発生時に適切にWebhookがトリガーされる
- エラーハンドリングとリトライ機能が動作
- UI/UXが直感的で使いやすい