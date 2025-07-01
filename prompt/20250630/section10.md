# Section-10: Unit & E2E Test Foundation
`<todo-key>: tests-placeholder`

## 🎯 目的
Jest/Supertestによる単体テストとPlaywrightによるE2Eテストの基盤を構築

## 📋 作業内容

### 1. Express側のテスト設定
```typescript
// ai-chat/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

### 2. テストセットアップ
```typescript
// ai-chat/tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});

// 環境変数のモック
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
```

### 3. Knowledge Base APIテスト
```typescript
// ai-chat/tests/routes/knowledge-base.test.ts
import request from 'supertest';
import express from 'express';
import { prismaMock } from '../setup';
import knowledgeBaseRouter from '../../src/routes/knowledge-base';
import { authMiddleware } from '../../src/middleware/auth';

// モックミドルウェア
jest.mock('../../src/middleware/auth', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.userId = 'test-user-id';
    req.organizationId = 'test-org-id';
    next();
  })
}));

jest.mock('../../src/middleware/organizationAccess', () => ({
  organizationAccessMiddleware: jest.fn((req, res, next) => next())
}));

describe('Knowledge Base API', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', knowledgeBaseRouter);
  });
  
  describe('GET /api/knowledge-base/items', () => {
    it('should return knowledge base items', async () => {
      const mockItems = [
        {
          id: 'kb-1',
          name: 'test.pdf',
          type: 'file',
          status: 'completed',
          createdAt: new Date()
        }
      ];
      
      prismaMock.knowledgeBase.findMany.mockResolvedValue(mockItems);
      
      const response = await request(app)
        .get('/api/knowledge-base/items')
        .expect(200);
      
      expect(response.body).toEqual({ items: mockItems });
      expect(prismaMock.knowledgeBase.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'test-org-id'
        },
        orderBy: { createdAt: 'desc' }
      });
    });
  });
  
  describe('POST /api/knowledge-base/upload', () => {
    it('should handle file upload', async () => {
      const mockKbItem = {
        id: 'kb-new',
        widgetId: 'widget-1',
        organizationId: 'test-org-id',
        name: 'test.pdf',
        type: 'file',
        source: 's3-key',
        status: 'pending',
        chunks: 0,
        createdAt: new Date()
      };
      
      prismaMock.knowledgeBase.create.mockResolvedValue(mockKbItem);
      
      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .field('widgetId', 'widget-1')
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .expect(200);
      
      expect(response.body).toMatchObject({
        id: 'kb-new',
        name: 'test.pdf',
        status: 'pending'
      });
    });
    
    it('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/knowledge-base/upload')
        .field('widgetId', 'widget-1')
        .attach('file', Buffer.from('test'), 'test.exe')
        .expect(400);
      
      expect(response.body).toEqual({ error: 'Invalid file type' });
    });
  });
});
```

### 4. Next.js側のテスト設定
```typescript
// ai-chat-ui/jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/app/_components/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/layout.tsx',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### 5. コンポーネントテスト
```typescript
// ai-chat-ui/app/_components/feature/knowledge-base/__tests__/KnowledgeBaseUploader.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KnowledgeBaseUploader } from '../KnowledgeBaseUploader';

// Mockドロップゾーン
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(({ onDrop }) => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ 'data-testid': 'file-input' }),
    isDragActive: false,
    acceptedFiles: [],
  })),
}));

describe('KnowledgeBaseUploader', () => {
  const mockOnUploadComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render upload area', () => {
    render(
      <KnowledgeBaseUploader 
        widgetId="widget-1" 
        onUploadComplete={mockOnUploadComplete}
      />
    );
    
    expect(screen.getByText(/ファイルをドラッグ&ドロップ/)).toBeInTheDocument();
    expect(screen.getByText(/対応形式: PDF, TXT, DOCX/)).toBeInTheDocument();
  });
  
  it('should handle file upload', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'kb-1' }),
      })
    ) as jest.Mock;
    
    render(
      <KnowledgeBaseUploader 
        widgetId="widget-1" 
        onUploadComplete={mockOnUploadComplete}
      />
    );
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('file-input');
    
    await userEvent.upload(input, file);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bff/knowledge-base/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });
    
    expect(mockOnUploadComplete).toHaveBeenCalled();
  });
});
```

### 6. Playwright E2E設定
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 7. E2Eテストシナリオ
```typescript
// e2e/knowledge-base.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Knowledge Base E2E', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
  });
  
  test('should upload PDF and get AI response', async ({ page }) => {
    // ウィジェット詳細ページへ
    await page.goto('/admin/org-1/widgets/widget-1/knowledge-base');
    
    // ファイルアップロード
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=ファイルをドラッグ&ドロップ');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'fixtures/test.pdf'));
    
    // アップロード完了を待つ
    await expect(page.locator('text=アップロード完了')).toBeVisible({
      timeout: 30000
    });
    
    // チャットページへ移動
    await page.goto('/admin/org-1/chats');
    
    // 質問を入力
    await page.fill('textarea[placeholder="メッセージを入力..."]', 'PDFの内容について教えて');
    await page.click('button[aria-label="送信"]');
    
    // AI応答を確認
    await expect(page.locator('text=PDFの内容に基づいて')).toBeVisible({
      timeout: 10000
    });
    
    // フィードバックボタンが表示されることを確認
    await expect(page.locator('button[aria-label="役に立った"]')).toBeVisible();
    
    // 否定的フィードバック
    await page.click('button[aria-label="役に立たなかった"]');
    await page.fill('textarea[placeholder="改善のためのフィードバック"]', 'もっと詳しく説明してほしい');
    await page.click('text=送信');
    
    // フィードバック送信完了
    await expect(page.locator('text=フィードバックを送信しました')).toBeVisible();
  });
  
  test('should show unresolved questions', async ({ page }) => {
    // 分析ページへ
    await page.goto('/admin/org-1/analytics');
    
    // 未解決質問タブ
    await page.click('text=未解決質問');
    
    // 未解決質問が表示される
    await expect(page.locator('text=未解決の質問')).toBeVisible();
    
    // FAQに追加
    const firstQuestion = page.locator('.unresolved-question').first();
    await firstQuestion.locator('button:has-text("FAQに追加")').click();
    
    // 成功メッセージ
    await expect(page.locator('text=FAQに追加しました')).toBeVisible();
  });
});
```

### 8. テストスクリプト追加
```json
// package.json に追加
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## ✅ 完了条件
- [ ] Jestの設定が完了している
- [ ] APIルートのテストが動作する
- [ ] コンポーネントのテストが動作する
- [ ] Playwrightの設定が完了している
- [ ] E2Eテストシナリオが実行できる
- [ ] カバレッジレポートが生成される

## 🚨 注意事項
- モックの適切な設定
- 非同期処理のテスト
- E2Eテストの実行時間
- CIでのテスト実行設定