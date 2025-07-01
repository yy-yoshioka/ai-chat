# Section-1b: Vectorization and RAG Search
`<todo-key>: kb-rag`

## 🎯 目的
アップロードしたファイルをベクトル化し、RAG検索を実装

## 📋 作業内容

### 1. BullMQワーカー設定
```typescript
// ai-chat/src/jobs/knowledgeBaseQueue.ts
import Bull from 'bull';
import { processKnowledgeBaseFile } from '../services/knowledgeBaseService';
import { logger } from '../lib/logger';

export const knowledgeBaseQueue = new Bull('knowledge-base', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// ファイル処理ワーカー
knowledgeBaseQueue.process('process-file', async (job) => {
  const { knowledgeBaseId, s3Key, mimeType } = job.data;
  
  logger.info('Processing knowledge base file', { 
    jobId: job.id, 
    knowledgeBaseId 
  });
  
  try {
    await processKnowledgeBaseFile(knowledgeBaseId, s3Key, mimeType);
    logger.info('Knowledge base file processed', { knowledgeBaseId });
  } catch (error) {
    logger.error('Failed to process knowledge base file', { 
      error, 
      knowledgeBaseId 
    });
    throw error;
  }
});

// 進捗更新
knowledgeBaseQueue.on('progress', (job, progress) => {
  logger.info('Job progress', { jobId: job.id, progress });
});
```

### 2. Knowledge Baseサービス実装
```typescript
// ai-chat/src/services/knowledgeBaseService.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAI } from 'openai';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import prisma from '../lib/prisma';
import { logger } from '../lib/logger';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  },
  forcePathStyle: true
});

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function processKnowledgeBaseFile(
  knowledgeBaseId: string,
  s3Key: string,
  mimeType: string
) {
  try {
    // ステータス更新
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: { status: 'processing' }
    });
    
    // S3からファイル取得
    const s3Response = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: s3Key
    }));
    
    const fileBuffer = await streamToBuffer(s3Response.Body);
    
    // ドキュメント読み込みとチャンク分割
    let documents;
    if (mimeType === 'application/pdf') {
      const loader = new PDFLoader(new Blob([fileBuffer]));
      documents = await loader.load();
    } else {
      // テキストファイルの処理
      const text = fileBuffer.toString('utf-8');
      documents = [{ pageContent: text, metadata: {} }];
    }
    
    // テキスト分割
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    
    const chunks = await splitter.splitDocuments(documents);
    
    // 各チャンクをベクトル化
    const vectors = [];
    const collectionName = `org_${knowledgeBaseId.substring(0, 8)}`;
    
    // コレクション作成（存在しない場合）
    try {
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 1536, // OpenAI embedding dimension
          distance: 'Cosine'
        }
      });
    } catch (error) {
      // コレクションが既に存在する場合は無視
    }
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // OpenAI Embeddings
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk.pageContent
      });
      
      const vector = embedding.data[0].embedding;
      
      // Qdrantに保存
      await qdrantClient.upsert(collectionName, {
        wait: true,
        points: [{
          id: `${knowledgeBaseId}_${i}`,
          vector: vector,
          payload: {
            knowledgeBaseId,
            chunkIndex: i,
            content: chunk.pageContent,
            metadata: chunk.metadata
          }
        }]
      });
      
      vectors.push(`${knowledgeBaseId}_${i}`);
    }
    
    // DB更新
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        status: 'completed',
        chunks: chunks.length,
        vectors: vectors,
        processedAt: new Date()
      }
    });
    
    logger.info('Knowledge base processing completed', {
      knowledgeBaseId,
      chunks: chunks.length
    });
    
  } catch (error) {
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        status: 'failed',
        error: error.message
      }
    });
    throw error;
  }
}

// Helper function
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
```

### 3. RAG検索API実装
```typescript
// ai-chat/src/routes/knowledge-base.ts に追加
// 検索エンドポイント
router.post(
  '/knowledge-base/search',
  authMiddleware,
  organizationAccessMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId, query, limit = 5 } = req.body;
      
      // クエリをベクトル化
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query
      });
      
      const queryVector = embedding.data[0].embedding;
      
      // 関連するKnowledge Baseを取得
      const knowledgeBases = await prisma.knowledgeBase.findMany({
        where: {
          widgetId,
          organizationId: req.organizationId!,
          status: 'completed'
        }
      });
      
      const collectionName = `org_${knowledgeBases[0]?.id.substring(0, 8)}`;
      
      // ベクトル検索
      const searchResult = await qdrantClient.search(collectionName, {
        vector: queryVector,
        limit: limit,
        withPayload: true
      });
      
      const results = searchResult.map(result => ({
        score: result.score,
        content: result.payload?.content,
        metadata: result.payload?.metadata
      }));
      
      res.json({ results });
    } catch (error) {
      next(error);
    }
  }
);

// 学習開始
router.post(
  '/knowledge-base/train',
  authMiddleware,
  organizationAccessMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId } = req.body;
      
      // 未処理のアイテムを取得
      const pendingItems = await prisma.knowledgeBase.findMany({
        where: {
          widgetId,
          organizationId: req.organizationId!,
          status: 'pending'
        }
      });
      
      // 各アイテムの処理ジョブを投入
      for (const item of pendingItems) {
        await knowledgeBaseQueue.add('process-file', {
          knowledgeBaseId: item.id,
          s3Key: item.source,
          mimeType: item.metadata?.mimeType
        });
      }
      
      res.json({ 
        message: 'Training started',
        itemsQueued: pendingItems.length 
      });
    } catch (error) {
      next(error);
    }
  }
);

// 学習状況
router.get(
  '/knowledge-base/status',
  authMiddleware,
  organizationAccessMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId } = req.query;
      
      const stats = await prisma.knowledgeBase.groupBy({
        by: ['status'],
        where: {
          organizationId: req.organizationId!,
          ...(widgetId && { widgetId: widgetId as string })
        },
        _count: true
      });
      
      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>);
      
      res.json({ stats: formattedStats });
    } catch (error) {
      next(error);
    }
  }
);
```

### 4. チャットAPIとの統合
```typescript
// ai-chat/src/routes/chat.ts を更新
// RAGコンテキストを含めた回答生成
import { searchKnowledgeBase } from '../services/knowledgeBaseService';

// 既存のチャットエンドポイントを更新
router.post('/chat', async (req, res, next) => {
  try {
    const { widgetId, message } = req.body;
    
    // Knowledge Base検索
    const kbResults = await searchKnowledgeBase(widgetId, message);
    
    // コンテキストを構築
    const context = kbResults
      .map(r => r.content)
      .join('\n\n');
    
    // プロンプト構築
    const systemPrompt = `
あなたは親切なAIアシスタントです。
以下のコンテキストを参考に、ユーザーの質問に答えてください。

コンテキスト:
${context}

コンテキストに関連する情報がない場合は、一般的な知識で回答してください。
`;
    
    // OpenAI APIで回答生成
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    });
    
    const reply = completion.choices[0].message.content;
    
    // チャット履歴を保存
    const chat = await prisma.chat.create({
      data: {
        widgetId,
        messages: {
          create: [
            { role: 'user', content: message },
            { role: 'assistant', content: reply }
          ]
        }
      },
      include: {
        messages: true
      }
    });
    
    res.json({ 
      reply,
      chatId: chat.id,
      sources: kbResults.slice(0, 3) // 上位3件のソースを返す
    });
  } catch (error) {
    next(error);
  }
});
```

### 5. ステータス表示UI
```typescript
// ai-chat-ui/app/_components/feature/knowledge-base/KnowledgeBaseStatus.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, CheckCircle, XCircle, Loader } from 'lucide-react';

interface KnowledgeBaseStatusProps {
  stats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export function KnowledgeBaseStatus({ stats }: KnowledgeBaseStatusProps) {
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  const completedPercentage = total > 0 ? (stats.completed / total) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>処理状況</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>全体の進捗</span>
              <span>{Math.round(completedPercentage)}%</span>
            </div>
            <Progress value={completedPercentage} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 text-yellow-500 animate-spin" />
              <div>
                <p className="text-sm font-medium">処理中</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">完了</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">待機中</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">エラー</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## ✅ 完了条件
- [ ] ファイルが自動的にベクトル化される
- [ ] ベクトルがQdrantに保存される
- [ ] チャットでKBの内容を参照した回答が返る
- [ ] 処理状況がUIに表示される

## 🚨 注意事項
- OpenAI APIキーの設定
- Qdrantの接続設定
- 大きなファイルの処理時のタイムアウト対策