# Section-9: Schema & Validation Enhancement
`<todo-key>: schema-ratchet`

## 🎯 目的
欠けているZodスキーマを追加し、BFFルートでのバリデーションを強化

## 📋 作業内容

### 1. 追加スキーマ定義
```typescript
// ai-chat-ui/app/_schemas/analytics.ts
import { z } from 'zod';

export const conversationFlowQuerySchema = z.object({
  widgetId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

export const unresolvedQuestionsQuerySchema = z.object({
  widgetId: z.string().uuid(),
  limit: z.coerce.number().min(1).max(100).default(50)
});

export const conversationFlowResponseSchema = z.object({
  nodes: z.array(z.object({
    id: z.number(),
    label: z.string()
  })),
  links: z.array(z.object({
    source: z.string(),
    target: z.string(),
    value: z.number()
  }))
});

export const unresolvedQuestionSchema = z.object({
  pattern: z.string(),
  count: z.number(),
  examples: z.array(z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string().datetime(),
    feedback: z.array(z.object({
      feedback: z.string(),
      createdAt: z.string().datetime()
    })).optional()
  })),
  firstOccurrence: z.string().datetime(),
  lastOccurrence: z.string().datetime()
});

export type ConversationFlowQuery = z.infer<typeof conversationFlowQuerySchema>;
export type UnresolvedQuestionsQuery = z.infer<typeof unresolvedQuestionsQuerySchema>;
export type ConversationFlowResponse = z.infer<typeof conversationFlowResponseSchema>;
export type UnresolvedQuestion = z.infer<typeof unresolvedQuestionSchema>;
```

### 2. 通知スキーマ
```typescript
// ai-chat-ui/app/_schemas/notifications.ts
import { z } from 'zod';

export const notificationTypeEnum = z.enum([
  'chat',
  'alert',
  'usage',
  'report',
  'system'
]);

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeEnum,
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string().datetime(),
  metadata: z.record(z.any()).optional()
});

export const notificationSettingsSchema = z.object({
  new_chat: z.object({
    email: z.boolean(),
    app: z.boolean()
  }),
  unresolved_question: z.object({
    email: z.boolean(),
    app: z.boolean()
  }),
  usage_limit: z.object({
    email: z.boolean(),
    app: z.boolean()
  }),
  weekly_report: z.object({
    email: z.boolean(),
    app: z.boolean()
  })
});

export const createNotificationSchema = z.object({
  type: notificationTypeEnum,
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  userId: z.string().uuid(),
  metadata: z.record(z.any()).optional()
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
```

### 3. APIキー管理スキーマ
```typescript
// ai-chat-ui/app/_schemas/api-keys.ts
import { z } from 'zod';

export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  lastUsed: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable()
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresAt: z.string().datetime().optional()
});

export const apiKeyListResponseSchema = z.object({
  apiKeys: z.array(apiKeySchema)
});

export type ApiKey = z.infer<typeof apiKeySchema>;
export type CreateApiKey = z.infer<typeof createApiKeySchema>;
export type ApiKeyListResponse = z.infer<typeof apiKeyListResponseSchema>;
```

### 4. システムヘルススキーマ
```typescript
// ai-chat-ui/app/_schemas/system-health.ts
import { z } from 'zod';

export const systemMetricsSchema = z.object({
  uptime: z.number(),
  responseTime: z.object({
    p50: z.number(),
    p90: z.number(),
    p99: z.number()
  }),
  errorRate: z.number(),
  activeUsers: z.number(),
  qps: z.number(), // Queries per second
  cpu: z.number(),
  memory: z.number()
});

export const healthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string().datetime(),
  services: z.object({
    database: z.enum(['connected', 'disconnected']),
    redis: z.enum(['connected', 'disconnected']),
    vectorDB: z.enum(['connected', 'disconnected']),
    storage: z.enum(['connected', 'disconnected'])
  }),
  version: z.string()
});

export type SystemMetrics = z.infer<typeof systemMetricsSchema>;
export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
```

### 5. BFFルートへのバリデーション追加例
```typescript
// ai-chat-ui/app/api/bff/analytics/conversation-flow/route.ts を更新
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/app/_config';
import { conversationFlowQuerySchema, conversationFlowResponseSchema } from '@/_schemas/analytics';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // クエリパラメータのバリデーション
    const { searchParams } = new URL(request.url);
    const queryValidation = conversationFlowQuerySchema.safeParse({
      widgetId: searchParams.get('widgetId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    });
    
    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.errors },
        { status: 400 }
      );
    }
    
    const response = await fetch(
      `${API_BASE_URL}/analytics/conversation-flow?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    
    // レスポンスのバリデーション
    const responseValidation = conversationFlowResponseSchema.safeParse(data);
    
    if (!responseValidation.success) {
      console.error('Invalid response from API:', responseValidation.error);
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 502 }
      );
    }
    
    return NextResponse.json(responseValidation.data);
  } catch (error) {
    console.error('Conversation flow analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
```

### 6. グローバルバリデーションヘルパー
```typescript
// ai-chat-ui/app/_utils/validation.ts
import { z } from 'zod';
import { NextResponse } from 'next/server';

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const validation = schema.safeParse(data);
  
  if (!validation.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      )
    };
  }
  
  return {
    success: true,
    data: validation.data
  };
}

export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const validation = schema.safeParse(data);
  
  if (!validation.success) {
    console.error('Response validation failed:', validation.error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 502 }
      )
    };
  }
  
  return {
    success: true,
    data: validation.data
  };
}
```

### 7. スキーマのエクスポート統合
```typescript
// ai-chat-ui/app/_schemas/index.ts を更新
export * from './auth';
export * from './billing';
export * from './chat';
export * from './dashboard';
export * from './faq';
export * from './logs';
export * from './organizations';
export * from './profile';
export * from './reports';
export * from './settings';
export * from './trial';
export * from './users';
export * from './widget';
export * from './knowledge-base';
export * from './training';
export * from './analytics';
export * from './notifications';
export * from './api-keys';
export * from './system-health';
```

## ✅ 完了条件
- [ ] すべての必要なスキーマが定義されている
- [ ] BFFルートでリクエストバリデーションが動作
- [ ] BFFルートでレスポンスバリデーションが動作
- [ ] 型の自動補完が効いている
- [ ] バリデーションエラーが適切に返される

## 🚨 注意事項
- スキーマの重複定義を避ける
- エラーメッセージのローカライズ
- パフォーマンスへの影響（大きなレスポンスの場合）
- 開発環境と本番環境でのバリデーション挙動