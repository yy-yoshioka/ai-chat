import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { trainingQueue } from '../jobs/trainingQueue';
import { logger } from '../lib/logger';
import { z } from 'zod';

const router = Router();

// フィードバックスキーマ
const feedbackSchema = z.object({
  messageId: z.string(),
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

    const { messageId, helpful, feedback } = validation.data;

    // メッセージの存在確認
    const message = await prisma.chatLog.findFirst({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // フィードバック保存
    const feedbackRecord = await prisma.messageFeedback.create({
      data: {
        chatLogId: messageId,
        helpful,
        feedback,
        userId: (req as AuthRequest).user.id,
      },
    });

    logger.info('Feedback received', {
      messageId,
      helpful,
      userId: (req as AuthRequest).user.id,
    });

    // 否定的フィードバックの場合、改善ジョブを投入
    if (!helpful && feedback) {
      await trainingQueue.add('improve-response', {
        feedbackId: feedbackRecord.id,
        messageId,
        feedback,
        originalQuery: message.question,
        originalResponse: message.answer,
        widgetId: message.widgetId,
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

      interface WhereClause {
        chatLog?: {
          widgetId: string;
        };
        createdAt?: {
          gte?: Date;
          lte?: Date;
        };
      }
      const where: WhereClause = {};

      if (widgetId) {
        where.chatLog = {
          widgetId,
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
            select: {
              widgetId: true,
              question: true,
              answer: true,
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
