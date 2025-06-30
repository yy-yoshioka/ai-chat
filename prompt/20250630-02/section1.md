# Section-1: Knowledge Base Upload Foundation
`<todo-key>: kb-upload`

## 🎯 目的
ファイルアップロードからS3保存までの基本機能を実装

## 📋 作業内容

### 1. Prismaスキーマ更新
```prisma
// ai-chat/prisma/schema.prisma に追加
model KnowledgeBase {
  id             String   @id @default(cuid())
  widgetId       String
  organizationId String
  name           String
  type           String   // file, url, text
  source         String   // S3 path or URL
  content        String?  @db.Text
  status         String   // pending, processing, completed, failed
  chunks         Int      @default(0)
  vectors        Json?    // Vector IDs array
  metadata       Json?
  error          String?
  createdAt      DateTime @default(now())
  processedAt    DateTime?
  
  widget         Widget       @relation(fields: [widgetId], references: [id])
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  @@index([widgetId])
  @@index([organizationId])
  @@index([status])
}
```

### 2. Express APIルート実装
```typescript
// ai-chat/src/routes/knowledge-base.ts
import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { authMiddleware } from '../middleware/auth';
import { organizationAccessMiddleware } from '../middleware/organizationAccess';
import prisma from '../lib/prisma';
import { logger } from '../lib/logger';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  },
  forcePathStyle: true // MinIO用
});

// ファイルアップロード
router.post(
  '/knowledge-base/upload',
  authMiddleware,
  organizationAccessMiddleware,
  upload.single('file'),
  async (req, res, next) => {
    try {
      const { widgetId, description } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      // S3にアップロード
      const s3Key = `knowledge-base/${req.organizationId}/${widgetId}/${Date.now()}-${file.originalname}`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype
      }));
      
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
            size: file.size
          }
        }
      });
      
      logger.info('Knowledge base file uploaded', {
        kbId: kbItem.id,
        fileName: file.originalname
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
  organizationAccessMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId } = req.query;
      
      const items = await prisma.knowledgeBase.findMany({
        where: {
          organizationId: req.organizationId!,
          ...(widgetId && { widgetId: widgetId as string })
        },
        orderBy: { createdAt: 'desc' }
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
  organizationAccessMiddleware,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const item = await prisma.knowledgeBase.findFirst({
        where: { id, organizationId: req.organizationId! }
      });
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      await prisma.knowledgeBase.delete({ where: { id } });
      
      logger.info('Knowledge base item deleted', { kbId: id });
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

### 3. BFFルート実装
```typescript
// ai-chat-ui/app/api/bff/knowledge-base/upload/route.ts
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
    const formData = await request.formData();
    
    const response = await fetch(`${API_BASE_URL}/knowledge-base/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Knowledge base upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### 4. UIコンポーネント実装
```typescript
// ai-chat-ui/app/_components/feature/knowledge-base/KnowledgeBaseUploader.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface KnowledgeBaseUploaderProps {
  widgetId: string;
  onUploadComplete?: () => void;
}

export function KnowledgeBaseUploader({ 
  widgetId, 
  onUploadComplete 
}: KnowledgeBaseUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('widgetId', widgetId);
        
        // Progress simulation (real implementation would use XMLHttpRequest)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);
        
        const response = await fetch('/api/bff/knowledge-base/upload', {
          method: 'POST',
          body: formData
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        toast({
          title: 'アップロード完了',
          description: `${file.name}をアップロードしました`,
        });
        
        onUploadComplete?.();
      } catch (error) {
        toast({
          title: 'アップロードエラー',
          description: 'ファイルのアップロードに失敗しました',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  }, [widgetId, onUploadComplete, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading
  });
  
  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      
      {isDragActive ? (
        <p className="text-lg">ドロップしてファイルをアップロード</p>
      ) : (
        <div>
          <p className="text-lg mb-2">
            ファイルをドラッグ&ドロップ
          </p>
          <p className="text-sm text-gray-500">
            または、クリックしてファイルを選択
          </p>
          <p className="text-xs text-gray-400 mt-2">
            対応形式: PDF, TXT, DOCX (最大10MB)
          </p>
        </div>
      )}
      
      {isUploading && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm mt-2">{uploadProgress}% アップロード中...</p>
        </div>
      )}
    </div>
  );
}
```

### 5. Hook実装
```typescript
// ai-chat-ui/app/_hooks/knowledge-base/useKnowledgeBase.ts
import useSWR from 'swr';
import { fetchGet, fetchDelete } from '@/_utils/fetcher';

export function useKnowledgeBase(widgetId: string) {
  const { data, error, mutate } = useSWR(
    `/api/bff/knowledge-base/items?widgetId=${widgetId}`,
    fetchGet
  );
  
  const deleteItem = async (itemId: string) => {
    await fetchDelete(`/api/bff/knowledge-base/items/${itemId}`);
    await mutate();
  };
  
  return {
    items: data?.items || [],
    isLoading: !error && !data,
    isError: error,
    deleteItem,
    mutate
  };
}
```

## ✅ 完了条件
- [ ] ファイルがS3（MinIO）に保存される
- [ ] DBにレコードが作成される
- [ ] UIでアップロード進捗が表示される
- [ ] 一覧表示・削除が動作する

## 🚨 注意事項
- S3の認証情報を環境変数に設定
- ファイルサイズ制限の確認
- MIMEタイプの検証