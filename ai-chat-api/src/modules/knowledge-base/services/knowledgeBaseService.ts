import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAI } from 'openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { prisma } from '@shared/database/prisma';
import { logger } from '@shared/logger';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
      data: { status: 'processing' },
    });

    // S3からファイル取得
    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: s3Key,
      })
    );

    const fileBuffer = await streamToBuffer(
      s3Response.Body as NodeJS.ReadableStream
    );

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
      chunkOverlap: 200,
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
          distance: 'Cosine',
        },
      });
    } catch (error) {
      // コレクションが既に存在する場合は無視
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // OpenAI Embeddings
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk.pageContent,
      });

      const vector = embedding.data[0].embedding;

      // Qdrantに保存
      await qdrantClient.upsert(collectionName, {
        wait: true,
        points: [
          {
            id: `${knowledgeBaseId}_${i}`,
            vector: vector,
            payload: {
              knowledgeBaseId,
              chunkIndex: i,
              content: chunk.pageContent,
              metadata: chunk.metadata,
            },
          },
        ],
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
        processedAt: new Date(),
      },
    });

    logger.info('Knowledge base processing completed', {
      knowledgeBaseId,
      chunks: chunks.length,
    });
  } catch (error) {
    await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error;
  }
}

export async function searchKnowledgeBase(
  widgetId: string,
  query: string,
  limit: number = 5
) {
  try {
    // クエリをベクトル化
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const queryVector = embedding.data[0].embedding;

    // 関連するKnowledge Baseを取得
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: {
        widgetId,
        status: 'completed',
      },
    });

    if (knowledgeBases.length === 0) {
      return [];
    }

    const collectionName = `org_${knowledgeBases[0].id.substring(0, 8)}`;

    // ベクトル検索
    const searchResult = await qdrantClient.search(collectionName, {
      vector: queryVector,
      limit: limit,
      with_payload: true,
    });

    const results = searchResult.map((result) => ({
      score: result.score,
      content: (result.payload?.content as string) || '',
      metadata: result.payload?.metadata,
    }));

    return results;
  } catch (error) {
    logger.error('Knowledge base search failed', { error, widgetId, query });
    return [];
  }
}

// Helper function
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
