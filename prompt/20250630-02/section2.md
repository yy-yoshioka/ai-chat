# Section-2: Training Feedback Loop
`<todo-key>: training-feedback`

## 🎯 目的
ユーザーフィードバックを収集し、改善ループを構築

## 📋 作業内容

### 1. Prismaスキーマ更新
```prisma
// ai-chat/prisma/schema.prisma に追加
model MessageFeedback {
  id        String   @id @default(cuid())
  messageId String
  helpful   Boolean
  feedback  String?  @db.Text
  userId    String
  createdAt DateTime @default(now())
  
  message   Message  @relation(fields: [messageId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([messageId])
  @@index([userId])
  @@index([helpful])
}

// Message モデルに追加
model Message {
  // ... 既存フィールド
  feedback MessageFeedback[]
}
```

### 2. Express APIルート実装
```typescript
// ai-chat/src/routes/training.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../lib/prisma';
import { trainingQueue } from '../jobs/trainingQueue';
import { logger } from '../lib/logger';
import { z } from 'zod';

const router = Router();

// フィードバックスキーマ
const feedbackSchema = z.object({
  messageId: z.string(),
  helpful: z.boolean(),
  feedback: z.string().optional()
});

// フィードバック送信
router.post(
  '/training/feedback',
  authMiddleware,
  async (req, res, next) => {
    try {
      const validation = feedbackSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input',
          details: validation.error.errors 
        });
      }
      
      const { messageId, helpful, feedback } = validation.data;
      
      // メッセージの存在確認
      const message = await prisma.message.findFirst({
        where: { id: messageId },
        include: { chat: true }
      });
      
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      
      // フィードバック保存
      const feedbackRecord = await prisma.messageFeedback.create({
        data: {
          messageId,
          helpful,
          feedback,
          userId: req.userId!
        }
      });
      
      logger.info('Feedback received', {
        messageId,
        helpful,
        userId: req.userId
      });
      
      // 否定的フィードバックの場合、改善ジョブを投入
      if (!helpful && feedback) {
        await trainingQueue.add('improve-response', {
          feedbackId: feedbackRecord.id,
          messageId,
          feedback,
          originalQuery: message.content,
          originalResponse: message.content,
          widgetId: message.chat.widgetId
        });
      }
      
      res.json({ 
        success: true,
        feedbackId: feedbackRecord.id 
      });
    } catch (error) {
      next(error);
    }
  }
);

// フィードバック統計
router.get(
  '/training/feedback/stats',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId, startDate, endDate } = req.query;
      
      const where: any = {};
      
      if (widgetId) {
        where.message = {
          chat: { widgetId }
        };
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }
      
      const [totalCount, helpfulCount, unhelpfulCount] = await Promise.all([
        prisma.messageFeedback.count({ where }),
        prisma.messageFeedback.count({ where: { ...where, helpful: true } }),
        prisma.messageFeedback.count({ where: { ...where, helpful: false } })
      ]);
      
      const satisfactionRate = totalCount > 0 
        ? (helpfulCount / totalCount) * 100 
        : 0;
      
      res.json({
        total: totalCount,
        helpful: helpfulCount,
        unhelpful: unhelpfulCount,
        satisfactionRate: Math.round(satisfactionRate * 10) / 10
      });
    } catch (error) {
      next(error);
    }
  }
);

// 否定的フィードバック一覧
router.get(
  '/training/feedback/negative',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId, limit = 50 } = req.query;
      
      const feedbacks = await prisma.messageFeedback.findMany({
        where: {
          helpful: false,
          feedback: { not: null },
          ...(widgetId && {
            message: { chat: { widgetId: widgetId as string } }
          })
        },
        include: {
          message: {
            include: {
              chat: {
                select: { widgetId: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit)
      });
      
      res.json({ feedbacks });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

### 3. BullMQワーカー設定
```typescript
// ai-chat/src/jobs/trainingQueue.ts
import Bull from 'bull';
import { improveResponse } from '../services/trainingService';
import { logger } from '../lib/logger';

export const trainingQueue = new Bull('training', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// 改善提案生成ワーカー
trainingQueue.process('improve-response', async (job) => {
  const { 
    feedbackId, 
    messageId, 
    feedback, 
    originalQuery, 
    originalResponse,
    widgetId 
  } = job.data;
  
  logger.info('Processing feedback improvement', { 
    jobId: job.id, 
    feedbackId 
  });
  
  try {
    await improveResponse({
      feedbackId,
      messageId,
      feedback,
      originalQuery,
      originalResponse,
      widgetId
    });
    
    logger.info('Feedback improvement completed', { feedbackId });
  } catch (error) {
    logger.error('Failed to process feedback improvement', { 
      error, 
      feedbackId 
    });
    throw error;
  }
});
```

### 4. トレーニングサービス実装
```typescript
// ai-chat/src/services/trainingService.ts
import { OpenAI } from 'openai';
import prisma from '../lib/prisma';
import { logger } from '../lib/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ImproveResponseParams {
  feedbackId: string;
  messageId: string;
  feedback: string;
  originalQuery: string;
  originalResponse: string;
  widgetId: string;
}

export async function improveResponse(params: ImproveResponseParams) {
  const { 
    feedbackId, 
    messageId, 
    feedback, 
    originalQuery, 
    originalResponse,
    widgetId 
  } = params;
  
  try {
    // 改善提案を生成
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `あなたはカスタマーサポートの改善アドバイザーです。
ユーザーからのフィードバックを基に、より良い回答を提案してください。`
        },
        {
          role: 'user',
          content: `
ユーザーの質問: ${originalQuery}
現在の回答: ${originalResponse}
ユーザーのフィードバック: ${feedback}

このフィードバックを踏まえて、より良い回答を提案してください。
また、今後同様の質問に対する改善点も教えてください。`
        }
      ],
      temperature: 0.7
    });
    
    const improvement = completion.choices[0].message.content;
    
    // 改善提案を保存（新しいテーブルが必要な場合）
    // TODO: ImprovementSuggestionテーブルを作成して保存
    
    // ログに記録
    logger.info('Improvement suggestion generated', {
      feedbackId,
      messageId,
      improvement: improvement?.substring(0, 100) + '...'
    });
    
    // 類似の質問パターンを検索して、FAQや応答ルールの候補として提案
    const similarMessages = await prisma.message.findMany({
      where: {
        chat: { widgetId },
        role: 'user',
        content: {
          contains: originalQuery.split(' ')[0] // 簡易的な類似検索
        }
      },
      take: 5
    });
    
    if (similarMessages.length > 3) {
      // FAQ候補として記録
      logger.info('FAQ candidate detected', {
        pattern: originalQuery,
        frequency: similarMessages.length
      });
    }
    
  } catch (error) {
    logger.error('Failed to generate improvement', { error, feedbackId });
    throw error;
  }
}
```

### 5. BFFルート実装
```typescript
// ai-chat-ui/app/api/bff/training/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/app/_config';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/training/feedback`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
```

### 6. フィードバックUIコンポーネント
```typescript
// ai-chat-ui/app/_components/feature/chat/MessageFeedback.tsx
'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface MessageFeedbackProps {
  messageId: string;
  onFeedbackSubmit?: () => void;
}

export function MessageFeedback({ 
  messageId, 
  onFeedbackSubmit 
}: MessageFeedbackProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const handleFeedback = async (helpful: boolean) => {
    if (submitted) return;
    
    if (!helpful) {
      setShowFeedbackForm(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bff/training/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, helpful })
      });
      
      if (!response.ok) throw new Error('Failed to submit feedback');
      
      setSubmitted(true);
      toast({
        title: 'フィードバックありがとうございます',
        description: 'より良いサービス提供に活用させていただきます',
      });
      
      onFeedbackSubmit?.();
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'フィードバックの送信に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitNegativeFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bff/training/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messageId, 
          helpful: false, 
          feedback: feedbackText 
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit feedback');
      
      setSubmitted(true);
      setShowFeedbackForm(false);
      toast({
        title: '貴重なご意見ありがとうございます',
        description: 'サービス改善の参考にさせていただきます',
      });
      
      onFeedbackSubmit?.();
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'フィードバックの送信に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="text-sm text-gray-500 mt-2">
        フィードバックを送信しました
      </div>
    );
  }
  
  return (
    <div className="mt-2">
      {!showFeedbackForm ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            この回答は役に立ちましたか？
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback(true)}
            disabled={isSubmitting}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback(false)}
            disabled={isSubmitting}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          <p className="text-sm text-gray-600">
            改善のためのフィードバックをお聞かせください
          </p>
          <Textarea
            placeholder="どのような点が不満でしたか？どのような回答を期待していましたか？"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmitNegativeFeedback}
              disabled={isSubmitting || !feedbackText.trim()}
            >
              送信
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowFeedbackForm(false);
                setFeedbackText('');
              }}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 7. Hook実装
```typescript
// ai-chat-ui/app/_hooks/training/useFeedback.ts
import useSWR from 'swr';
import { fetchGet } from '@/_utils/fetcher';

export function useFeedbackStats(widgetId?: string) {
  const { data, error } = useSWR(
    `/api/bff/training/feedback/stats${widgetId ? `?widgetId=${widgetId}` : ''}`,
    fetchGet
  );
  
  return {
    stats: data,
    isLoading: !error && !data,
    isError: error
  };
}

export function useNegativeFeedback(widgetId?: string, limit = 50) {
  const { data, error } = useSWR(
    `/api/bff/training/feedback/negative?limit=${limit}${widgetId ? `&widgetId=${widgetId}` : ''}`,
    fetchGet
  );
  
  return {
    feedbacks: data?.feedbacks || [],
    isLoading: !error && !data,
    isError: error
  };
}