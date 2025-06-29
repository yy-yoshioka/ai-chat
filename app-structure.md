# App Directory Structure

## AI Chat UI - App Directory Tree

```
app/
├── _components/                    # 共通コンポーネント
│   ├── AdminAuthGuard.tsx         # 管理者認証ガード
│   ├── AdminLayout.tsx            # 管理者レイアウト
│   ├── AuthGuard.tsx              # 認証ガード
│   ├── billing-kpi-dashboard.tsx  # 請求KPIダッシュボード
│   ├── billing-plans.tsx          # 請求プラン
│   ├── Chat/                      # チャット関連コンポーネント
│   │   ├── ChatContainer.tsx      # チャットコンテナ
│   │   ├── ChatInput.tsx          # チャット入力
│   │   └── ChatMessage.tsx        # チャットメッセージ
│   ├── Dashboard/                 # ダッシュボード関連
│   │   ├── ChartView.tsx          # チャート表示
│   │   └── ReportTable.tsx        # レポートテーブル
│   ├── DynamicWidgetLoader.tsx    # 動的ウィジェットローダー
│   ├── FAQ/                       # FAQ関連コンポーネント
│   │   ├── FAQForm.tsx            # FAQフォーム
│   │   ├── FAQItem.tsx            # FAQアイテム
│   │   └── FAQList.tsx            # FAQリスト
│   ├── Layout.tsx                 # レイアウト
│   ├── Navigation.tsx             # ナビゲーション
│   ├── OrgAdminGuard.tsx          # 組織管理者ガード
│   └── PermissionGate.tsx         # 権限ゲート
│
├── _hooks/                        # カスタムフック
│   ├── useAuth.ts                 # 認証フック
│   └── useCurrentOrg.ts           # 現在の組織フック
│
├── _lib/                          # ライブラリ・ユーティリティ
│   ├── api-org.ts                 # 組織API
│   ├── api.ts                     # API関数
│   ├── email-templates.ts         # メールテンプレート
│   └── withAuth.tsx               # 認証HOC
│
├── (auth)/                        # 認証関連ページ
│   ├── layout.tsx                 # 認証レイアウト
│   ├── login/
│   │   └── page.tsx               # ログインページ
│   ├── logout/
│   │   └── page.tsx               # ログアウトページ
│   ├── signup/
│   │   └── page.tsx               # サインアップページ
│   ├── step-install.tsx           # インストールステップ
│   └── step-plan.tsx              # プランステップ
│
├── (marketing)/                   # マーケティング・公開ページ
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx           # ブログ記事詳細
│   │   └── index.tsx              # ブログ一覧
│   ├── faq/
│   │   └── index.tsx              # FAQ公開ページ
│   ├── layout.tsx                 # マーケティングレイアウト
│   ├── page.tsx                   # ランディングページ
│   ├── privacy/
│   │   └── page.tsx               # プライバシーポリシー
│   └── status/
│       └── page.tsx               # ステータスページ
│
├── (org)/                         # 組織管理ページ
│   └── admin/
│       └── [orgId]/               # 組織ID別管理画面
│           ├── billing/
│           │   └── page.tsx       # 請求管理
│           ├── billing-plans/
│           │   └── page.tsx       # 請求プラン管理
│           ├── chats/
│           │   └── page.tsx       # チャット管理
│           ├── dashboard/
│           │   └── page.tsx       # ダッシュボード
│           ├── faq/
│           │   ├── [id]/
│           │   │   └── page.tsx   # FAQ詳細編集
│           │   ├── create/
│           │   │   └── page.tsx   # FAQ作成
│           │   └── page.tsx       # FAQ管理
│           ├── layout.tsx         # 組織管理レイアウト
│           ├── logs/
│           │   └── page.tsx       # ログ管理
│           ├── reports/
│           │   └── page.tsx       # レポート管理
│           ├── settings/
│           │   ├── page.tsx       # 設定
│           │   └── widgets/
│           │       └── page.tsx   # ウィジェット設定
│           ├── users/
│           │   └── page.tsx       # ユーザー管理
│           └── widgets/
│               ├── create/
│               │   └── page.tsx   # ウィジェット作成
│               └── page.tsx       # ウィジェット管理
│
├── (super)/                       # スーパー管理者ページ
│   └── superadmin/
│       ├── incidents/
│       │   └── page.tsx           # インシデント管理
│       ├── layout.tsx             # スーパー管理者レイアウト
│       ├── metrics/
│       │   └── page.tsx           # メトリクス
│       └── tenants/
│           └── page.tsx           # テナント管理
│
├── (user)/                        # ユーザーページ
│   ├── billing/
│   │   ├── cancel/                # 請求キャンセル
│   │   ├── success/               # 請求成功
│   │   └── success.tsx            # 請求成功ページ
│   ├── layout.tsx                 # ユーザーレイアウト
│   └── profile/
│       └── page.tsx               # プロフィールページ
│
├── admin/                         # 管理者機能
│   └── org-selector/
│       └── page.tsx               # 組織選択ページ
│
├── api/                           # API Routes
│   ├── beta-invite/
│   │   └── route.ts               # ベータ招待API
│   ├── billing/
│   │   ├── checkout.ts            # 請求チェックアウト
│   │   └── webhook.ts             # 請求Webhook
│   ├── chat/
│   │   └── widget/
│   │       └── [widgetKey].ts     # ウィジェットチャットAPI
│   ├── companies/
│   │   └── index.ts               # 企業API
│   ├── cron/
│   │   ├── email-drip.ts          # メールドリップ
│   │   └── usage-record.ts        # 使用量記録
│   ├── login/
│   │   └── route.ts               # ログインAPI
│   ├── logout/
│   │   └── route.ts               # ログアウトAPI
│   ├── me/
│   │   └── route.ts               # ユーザー情報API
│   ├── signup/
│   │   └── route.ts               # サインアップAPI
│   ├── status/
│   │   └── rss.ts                 # ステータスRSS
│   ├── test/
│   │   └── email-drip.ts          # メールドリップテスト
│   ├── trial/
│   │   └── extend.ts              # トライアル延長
│   └── widgets/
│       ├── [widgetKey].ts         # ウィジェットAPI
│       └── index.ts               # ウィジェット一覧API
│
└── layout.tsx                     # ルートレイアウト
```

## 構造の説明

### ディレクトリ分類

- **_components/**: 再利用可能なReactコンポーネント
- **_hooks/**: カスタムReactフック
- **_lib/**: ユーティリティ関数とライブラリ
- **(auth)/**: 認証関連のページ（ログイン、サインアップ等）
- **(marketing)/**: 公開マーケティングページ
- **(org)/**: 組織管理機能
- **(super)/**: スーパー管理者専用機能
- **(user)/**: 一般ユーザー向けページ
- **admin/**: 管理者向け機能
- **api/**: Next.js API Routes

### Route Groups

Next.js 13のRoute Groupsを使用して、関連するページを論理的にグループ化しています：

- `(auth)`: 認証フロー
- `(marketing)`: マーケティング・公開ページ
- `(org)`: 組織管理
- `(super)`: スーパー管理者
- `(user)`: ユーザー機能

### 主要機能

1. **多層認証システム**: 一般ユーザー、組織管理者、スーパー管理者
2. **チャット機能**: ウィジェット経由でのチャット
3. **請求・サブスクリプション管理**
4. **FAQ管理システム**
5. **ダッシュボード・レポート機能**
6. **動的ウィジェット機能**

---

**総ディレクトリ数**: 61  
**総ファイル数**: 77  
**生成日**: `date +'%Y-%m-%d'` 