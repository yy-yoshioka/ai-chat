import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { authMiddleware } from '../middleware/auth';
import {
  requireOrganizationAccess,
  OrganizationRequest,
} from '../middleware/organizationAccess';
import { prisma } from '../lib/prisma';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // MinIO用
});

// ファイルアップロード
router.post(
  '/knowledge-base/upload',
  authMiddleware,
  requireOrganizationAccess,
  upload.single('file') as any,
  async (req: OrganizationRequest, res, next) => {
    try {
      const { widgetId, description } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // S3にアップロード
      const s3Key = `knowledge-base/${req.organizationId}/${widgetId}/${Date.now()}-${file.originalname}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      // DBに記録
      const kbItem = await prisma.knowledgeBase.create({
        data: {
          widgetId,
          organizationId: req.organizationId!,
          name: file.originalname,
          type: 'file',
          source: s3Key,
          status: 'pending',
          metadata: {
            description,
            mimeType: file.mimetype,
            size: file.size,
          },
        },
      });

      console.log('Knowledge base file uploaded:', {
        kbId: kbItem.id,
        fileName: file.originalname,
      });

      res.json(kbItem);
    } catch (error) {
      next(error);
    }
  }
);

// 一覧取得
router.get(
  '/knowledge-base/items',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res, next) => {
    try {
      const { widgetId } = req.query;

      const items = await prisma.knowledgeBase.findMany({
        where: {
          organizationId: req.organizationId!,
          ...(widgetId && { widgetId: widgetId as string }),
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ items });
    } catch (error) {
      next(error);
    }
  }
);

// 削除
router.delete(
  '/knowledge-base/items/:id',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res, next) => {
    try {
      const { id } = req.params;

      const item = await prisma.knowledgeBase.findFirst({
        where: { id, organizationId: req.organizationId! },
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      await prisma.knowledgeBase.delete({ where: { id } });

      console.log('Knowledge base item deleted:', { kbId: id });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
