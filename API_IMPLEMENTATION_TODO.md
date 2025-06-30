# API Implementation TODO

## 概要
Next.jsアプリケーションとExpressバックエンドで未実装のAPIエンドポイントの一覧と要件定義。

## 1. Next.js側 - 作成が必要なroute.tsファイル

### 1.1 ダッシュボードAPI
**ファイル**: `ai-chat-ui/app/api/dashboard/route.ts`

**要件**:
- メソッド: GET
- 認証: 必須
- レスポンス:
  ```typescript
  {
    metrics: {
      totalChats: number;
      activeUsers: number;
      averageResponseTime: number;
      satisfactionScore: number;
    };
    recentActivity: Array<{
      id: string;
      type: 'chat' | 'user' | 'system';
      message: string;
      timestamp: string;
    }>;
    chartData: {
      daily: Array<{ date: string; count: number }>;
      weekly: Array<{ week: string; count: number }>;
    };
  }
  ```

### 1.2 レポートAPI
**ファイル**: `ai-chat-ui/app/api/reports/route.ts`

**要件**:
- メソッド: GET
- 認証: 必須（管理者のみ）
- クエリパラメータ:
  - `startDate`: ISO 8601形式
  - `endDate`: ISO 8601形式
  - `type`: 'daily' | 'weekly' | 'monthly'
- レスポンス:
  ```typescript
  {
    summary: {
      totalChats: number;
      uniqueUsers: number;
      averageSatisfaction: number;
      resolutionRate: number;
    };
    dailyChats: Array<{
      date: string;
      count: number;
      satisfaction: number;
    }>;
    topTopics: Array<{
      topic: string;
      count: number;
      percentage: number;
    }>;
  }
  ```

### 1.3 ユーザー管理API
**ファイル**: 
- `ai-chat-ui/app/api/users/route.ts`
- `ai-chat-ui/app/api/users/[id]/route.ts`
- `ai-chat-ui/app/api/users/invite/route.ts`

**要件**:

#### GET /api/users
- 認証: 必須（管理者のみ）
- クエリパラメータ:
  - `page`: number (デフォルト: 1)
  - `limit`: number (デフォルト: 20)
  - `search`: string
  - `role`: 'admin' | 'user'
  - `status`: 'active' | 'inactive'
- レスポンス:
  ```typescript
  {
    users: Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      status: string;
      createdAt: string;
      lastLogin: string;
    }>;
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  }
  ```

#### PUT /api/users/[id]
- 認証: 必須（管理者のみ）
- ボディ:
  ```typescript
  {
    role?: string;
    status?: 'active' | 'inactive';
    permissions?: string[];
  }
  ```

#### DELETE /api/users/[id]
- 認証: 必須（管理者のみ）
- ソフトデリート実装

#### POST /api/users/invite
- 認証: 必須（管理者のみ）
- ボディ:
  ```typescript
  {
    email: string;
    role: string;
    organizationId: string;
    sendEmail?: boolean;
  }
  ```

### 1.4 組織管理API
**ファイル**: `ai-chat-ui/app/api/organizations/route.ts`

**要件**:
- メソッド: GET
- 認証: 必須
- レスポンス:
  ```typescript
  {
    organizations: Array<{
      id: string;
      name: string;
      plan: string;
      userCount: number;
      widgetCount: number;
      createdAt: string;
    }>;
  }
  ```

### 1.5 管理者用チャットAPI
**ファイル**: 
- `ai-chat-ui/app/api/admin/chats/route.ts`
- `ai-chat-ui/app/api/admin/chat-metrics/route.ts`

**要件**:

#### GET /api/admin/chats
- 認証: 必須（管理者のみ）
- クエリパラメータ:
  - `page`: number
  - `limit`: number
  - `status`: 'active' | 'resolved' | 'pending'
  - `startDate`: ISO 8601形式
  - `endDate`: ISO 8601形式
- レスポンス:
  ```typescript
  {
    chats: Array<{
      id: string;
      userId: string;
      userName: string;
      status: string;
      messages: number;
      satisfaction: number;
      createdAt: string;
      resolvedAt?: string;
    }>;
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  }
  ```

#### GET /api/admin/chat-metrics
- 認証: 必須（管理者のみ）
- レスポンス:
  ```typescript
  {
    totalChats: number;
    activeChats: number;
    averageResponseTime: number;
    averageSatisfaction: number;
    resolutionRate: number;
    peakHours: Array<{ hour: number; count: number }>;
  }
  ```

### 1.6 組織別ウィジェットAPI
**ファイル**: `ai-chat-ui/app/api/organizations/[orgId]/widgets/route.ts`

**要件**:
- メソッド: GET
- 認証: 必須（組織メンバーのみ）
- レスポンス:
  ```typescript
  {
    widgets: Array<{
      id: string;
      name: string;
      key: string;
      domain: string;
      isActive: boolean;
      chatCount: number;
      createdAt: string;
    }>;
  }
  ```

## 2. Express側 - 作成が必要なエンドポイント

### 2.1 ユーザー管理ルート
**ファイル**: `ai-chat-api/src/routes/users.ts`

**実装要件**:
- Prismaを使用したCRUD操作
- ページネーション実装
- 検索機能（email、name）
- ロールベースアクセス制御
- 監査ログ記録
- メール招待機能（SendGrid/AWS SES使用）

### 2.2 組織管理ルート
**ファイル**: `ai-chat-api/src/routes/organizations.ts`

**実装要件**:
- 組織のCRUD操作
- ユーザーの組織所属管理
- プラン別の制限チェック
- ウィジェット数のカウント
- 組織削除時のカスケード処理

### 2.3 ダッシュボードルート
**ファイル**: `ai-chat-api/src/routes/dashboard.ts`

**実装要件**:
- リアルタイムメトリクスの集計
- キャッシュ実装（Redis推奨）
- 複数のデータソースからの集約
- パフォーマンス最適化

### 2.4 レポートルート
**ファイル**: `ai-chat-api/src/routes/reports.ts`

**実装要件**:
- 時系列データの集計
- エクスポート機能（CSV/PDF）
- スケジュールレポート機能
- データ可視化用の前処理

### 2.5 管理者機能拡張
**ファイル**: `ai-chat-api/src/routes/admin.ts`（既存ファイルに追加）

**実装要件**:
- 高度なフィルタリング機能
- バッチ操作サポート
- リアルタイムメトリクス
- 監査ログ統合

## 3. 共通要件

### セキュリティ
- JWT認証の実装
- ロールベースアクセス制御（RBAC）
- APIレート制限
- 入力値バリデーション
- SQLインジェクション対策

### パフォーマンス
- データベースクエリの最適化
- 適切なインデックス設定
- キャッシュ戦略（Redis）
- ページネーション実装

### エラーハンドリング
- 統一されたエラーレスポンス形式
- 適切なHTTPステータスコード
- エラーログ記録（Sentry統合）

### テスト
- 単体テスト（Jest）
- 統合テスト
- E2Eテスト（Playwright）
- APIドキュメント（Swagger/OpenAPI）

## 4. 実装優先順位

1. **高優先度**
   - ユーザー管理API（認証・認可の基盤）
   - 組織管理API（マルチテナンシーの基盤）

2. **中優先度**
   - ダッシュボードAPI（ユーザー体験向上）
   - 管理者用チャットAPI（運用効率化）

3. **低優先度**
   - レポートAPI（分析機能）
   - 組織別ウィジェットAPI（既存APIで代替可能）

## 5. 実装スケジュール案

- **Week 1-2**: ユーザー管理API + 組織管理API
- **Week 3**: ダッシュボードAPI + 管理者機能
- **Week 4**: レポートAPI + テスト実装
- **Week 5**: 統合テスト + デプロイ準備

## 6. 注意事項

- 既存のBFF（Backend for Frontend）パターンとの整合性を保つ
- Prismaスキーマの更新が必要な場合は事前にマイグレーション計画を立てる
- 本番環境へのデプロイは段階的に行う（カナリアリリース推奨）
- APIバージョニング戦略を検討する

---

作成日: 2025-06-30
更新日: 2025-06-30