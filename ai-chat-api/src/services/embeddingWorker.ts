import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Redis接続設定
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
});

// ジョブタイプの定義
export interface EmbeddingJobData {
  type: 'document' | 'faq';
  id: string;
  content: string;
  organizationId: string;
}

// Embedding処理キュー
export const embeddingQueue = new Queue<EmbeddingJobData>(
  'embedding-processing',
  {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  }
);

// テキストチャンク分割（OpenAIの制限に合わせて）
function splitTextIntoChunks(
  text: string,
  maxChunkSize: number = 8000
): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?。！？]/);
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    const potentialChunk =
      currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;

    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [text.substring(0, maxChunkSize)];
}

// テキストからエンベディングを生成
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // or 'text-embedding-3-large' for higher quality
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

// ドキュメントのエンベディング処理
async function processDocumentEmbedding(
  jobData: EmbeddingJobData
): Promise<void> {
  try {
    // ドキュメントをデータベースから取得
    const document = await prisma.document.findUnique({
      where: { id: jobData.id },
      include: { knowledgeBase: true },
    });

    if (!document) {
      throw new Error(`Document not found: ${jobData.id}`);
    }

    // ドキュメントのステータスを「処理中」に更新
    await prisma.document.update({
      where: { id: jobData.id },
      data: { status: 'processing' },
    });

    console.log(`Processing document embedding: ${document.title}`);

    // テキストをチャンク分割
    const chunks = splitTextIntoChunks(document.content);
    console.log(`Split document into ${chunks.length} chunks`);

    // 各チャンクのエンベディングを生成して平均化
    const embeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`
      );

      const embedding = await generateEmbedding(chunk);
      embeddings.push(embedding);

      // API制限を考慮して少し待機
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // エンベディングの平均を計算
    const avgEmbedding = embeddings[0].map(
      (_, index) =>
        embeddings.reduce((sum, embedding) => sum + embedding[index], 0) /
        embeddings.length
    );

    // データベースに保存（embeddingフィールドは生のSQLで更新）
    await prisma.$executeRaw`
      UPDATE "documents" 
      SET "embedding" = ${`[${avgEmbedding.join(',')}]`}::vector,
          "status" = 'completed',
          "wordCount" = ${document.content.length},
          "updatedAt" = NOW()
      WHERE "id" = ${jobData.id}
    `;

    console.log(`Successfully processed document embedding: ${document.title}`);
  } catch (error) {
    console.error(`Failed to process document embedding:`, error);

    // エラー状態を記録
    await prisma.document.update({
      where: { id: jobData.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// FAQのエンベディング処理
async function processFAQEmbedding(jobData: EmbeddingJobData): Promise<void> {
  try {
    // FAQをデータベースから取得
    const faq = await prisma.fAQ.findUnique({
      where: { id: jobData.id },
    });

    if (!faq) {
      throw new Error(`FAQ not found: ${jobData.id}`);
    }

    console.log(`Processing FAQ embedding: ${faq.question}`);

    // 質問と回答を組み合わせてエンベディング生成
    const combinedText = `質問: ${faq.question}\n回答: ${faq.answer}`;
    const embedding = await generateEmbedding(combinedText);

    // データベースに保存（embeddingフィールドは生のSQLで更新）
    await prisma.$executeRaw`
      UPDATE "faqs" 
      SET "embedding" = ${`[${embedding.join(',')}]`}::vector,
          "updatedAt" = NOW()
      WHERE "id" = ${jobData.id}
    `;

    console.log(`Successfully processed FAQ embedding: ${faq.question}`);
  } catch (error) {
    console.error(`Failed to process FAQ embedding:`, error);
    throw error;
  }
}

// ワーカー設定
export const embeddingWorker = new Worker<EmbeddingJobData>(
  'embedding-processing',
  async (job: Job<EmbeddingJobData>) => {
    const { data } = job;
    console.log(`Processing embedding job: ${data.type} ${data.id}`);

    try {
      switch (data.type) {
        case 'document':
          await processDocumentEmbedding(data);
          break;
        case 'faq':
          await processFAQEmbedding(data);
          break;
        default:
          throw new Error(`Unknown job type: ${data.type}`);
      }

      // ジョブ完了の進捗を更新
      await job.updateProgress(100);
    } catch (error) {
      console.error(`Embedding job failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // 同時実行数を制限（API制限を考慮）
  }
);

// イベントリスナー設定
embeddingWorker.on('completed', (job) => {
  console.log(`✅ Embedding job completed: ${job.data.type} ${job.data.id}`);
});

embeddingWorker.on('failed', (job, error) => {
  console.error(
    `❌ Embedding job failed: ${job?.data.type} ${job?.data.id}`,
    error
  );
});

embeddingWorker.on('progress', (job, progress) => {
  console.log(
    `📊 Embedding job progress: ${job.data.type} ${job.data.id} - ${progress}%`
  );
});

// ドキュメントのエンベディングジョブを追加
export async function queueDocumentEmbedding(
  documentId: string,
  organizationId: string
): Promise<void> {
  // ドキュメントの内容を取得
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  await embeddingQueue.add('process-document', {
    type: 'document',
    id: documentId,
    content: document.content,
    organizationId,
  });

  console.log(`Queued document embedding job: ${documentId}`);
}

// FAQのエンベディングジョブを追加
export async function queueFAQEmbedding(
  faqId: string,
  organizationId: string
): Promise<void> {
  // FAQの内容を取得
  const faq = await prisma.fAQ.findUnique({
    where: { id: faqId },
  });

  if (!faq) {
    throw new Error(`FAQ not found: ${faqId}`);
  }

  await embeddingQueue.add('process-faq', {
    type: 'faq',
    id: faqId,
    content: `${faq.question} ${faq.answer}`,
    organizationId,
  });

  console.log(`Queued FAQ embedding job: ${faqId}`);
}

// 全ドキュメントの再エンベディング（クロールジョブ用）
export async function reprocessAllEmbeddings(
  organizationId: string
): Promise<void> {
  console.log(
    `Starting reprocessing embeddings for organization: ${organizationId}`
  );

  // 組織の全ドキュメントを取得
  const documents = await prisma.document.findMany({
    where: {
      knowledgeBase: {
        organizationId,
      },
      status: 'completed', // 完了済みのもののみ
    },
  });

  // 組織の全FAQを取得
  const faqs = await prisma.fAQ.findMany({
    where: {
      organizationId,
      isActive: true,
    },
  });

  // バッチでジョブを追加
  const jobs = [
    ...documents.map((doc) => ({
      name: 'reprocess-document',
      data: {
        type: 'document' as const,
        id: doc.id,
        content: doc.content,
        organizationId,
      },
    })),
    ...faqs.map((faq) => ({
      name: 'reprocess-faq',
      data: {
        type: 'faq' as const,
        id: faq.id,
        content: `${faq.question} ${faq.answer}`,
        organizationId,
      },
    })),
  ];

  if (jobs.length > 0) {
    await embeddingQueue.addBulk(jobs);
    console.log(
      `Queued ${jobs.length} reprocessing jobs for organization: ${organizationId}`
    );
  }
}

// キューの統計情報を取得
export async function getEmbeddingQueueStats() {
  const waiting = await embeddingQueue.getWaiting();
  const active = await embeddingQueue.getActive();
  const completed = await embeddingQueue.getCompleted();
  const failed = await embeddingQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
}

// クリーンアップ
export async function shutdownEmbeddingWorker(): Promise<void> {
  console.log('Shutting down embedding worker...');
  await embeddingWorker.close();
  await embeddingQueue.close();
  await redisConnection.quit();
}

// プロセス終了時のクリーンアップ
process.on('SIGINT', shutdownEmbeddingWorker);
process.on('SIGTERM', shutdownEmbeddingWorker);
