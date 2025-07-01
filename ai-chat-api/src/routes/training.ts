import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { trainingQueue } from '../jobs/trainingQueue';
import { logger } from '../lib/logger';
import { z } from 'zod';

const router = Router();

// フィードバックスキーマ
const feedbackSchema = z.object({
  chatLogId: z.string(), // Updated to use chatLogId instead of messageId
  helpful: z.boolean(),
  feedback: z.string().optional(),
});

// フィードバック送信
router.post('/training/feedback', authMiddleware, async (req, res, next) => {
  try {
    const validation = feedbackSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.errors,
      });
    }

    const { chatLogId, helpful, feedback } = validation.data;

    // チャットログの存在確認
    const chatLog = await prisma.chatLog.findFirst({
      where: { id: chatLogId },
      include: { widget: true },
    });

    if (!chatLog) {
      return res.status(404).json({ error: 'Chat log not found' });
    }

    // フィードバック保存
    const feedbackRecord = await prisma.messageFeedback.create({
      data: {
        chatLogId,
        helpful,
        feedback,
        userId: (req as any).userId!,
      },
    });

    logger.info('Feedback received', {
      chatLogId,
      helpful,
      userId: (req as any).userId,
    });

    // 否定的フィードバックの場合、改善ジョブを投入
    if (!helpful && feedback) {
      await trainingQueue.add('improve-response', {
        feedbackId: feedbackRecord.id,
        chatLogId,
        feedback,
        originalQuery: chatLog.question,
        originalResponse: chatLog.answer,
        widgetId: chatLog.widgetId,
      });
    }

    res.json({
      success: true,
      feedbackId: feedbackRecord.id,
    });
  } catch (error) {
    next(error);
  }
});

// フィードバック統計
router.get(
  '/training/feedback/stats',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId, startDate, endDate } = req.query;

      const where: {
        chatLog?: { widgetId: string };
        createdAt?: { gte?: Date; lte?: Date };
      } = {};

      if (widgetId) {
        where.chatLog = {
          widgetId: widgetId as string,
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
        prisma.messageFeedback.count({ where: { ...where, helpful: false } }),
      ]);

      const satisfactionRate =
        totalCount > 0 ? (helpfulCount / totalCount) * 100 : 0;

      res.json({
        total: totalCount,
        helpful: helpfulCount,
        unhelpful: unhelpfulCount,
        satisfactionRate: Math.round(satisfactionRate * 10) / 10,
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
            chatLog: { widgetId: widgetId as string },
          }),
        },
        include: {
          chatLog: {
            include: {
              widget: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      });

      res.json({ feedbacks });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
