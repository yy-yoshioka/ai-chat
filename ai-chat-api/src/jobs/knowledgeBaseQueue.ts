import Bull from 'bull';
import { processKnowledgeBaseFile } from '../services/knowledgeBaseService';
import { logger } from '../lib/logger';

export const knowledgeBaseQueue = new Bull('knowledge-base', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// ファイル処理ワーカー
knowledgeBaseQueue.process('process-file', async (job) => {
  const { knowledgeBaseId, s3Key, mimeType } = job.data;

  logger.info('Processing knowledge base file', {
    jobId: job.id,
    knowledgeBaseId,
  });

  try {
    await processKnowledgeBaseFile(knowledgeBaseId, s3Key, mimeType);
    logger.info('Knowledge base file processed', { knowledgeBaseId });
  } catch (error) {
    logger.error('Failed to process knowledge base file', {
      error,
      knowledgeBaseId,
    });
    throw error;
  }
});

// 進捗更新
knowledgeBaseQueue.on('progress', (job, progress) => {
  logger.info('Job progress', { jobId: job.id, progress });
});
