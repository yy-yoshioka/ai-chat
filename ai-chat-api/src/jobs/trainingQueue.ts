import Bull from 'bull';
import { improveResponse } from '../services/trainingService';
import { logger } from '../lib/logger';

export const trainingQueue = new Bull('training', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// 改善提案生成ワーカー
trainingQueue.process('improve-response', async (job) => {
  const {
    feedbackId,
    messageId,
    feedback,
    originalQuery,
    originalResponse,
    widgetId,
  } = job.data;

  logger.info('Processing feedback improvement', {
    jobId: job.id,
    feedbackId,
  });

  try {
    await improveResponse({
      feedbackId,
      messageId,
      feedback,
      originalQuery,
      originalResponse,
      widgetId,
    });

    logger.info('Feedback improvement completed', { feedbackId });
  } catch (error) {
    logger.error('Failed to process feedback improvement', {
      error,
      feedbackId,
    });
    throw error;
  }
});
