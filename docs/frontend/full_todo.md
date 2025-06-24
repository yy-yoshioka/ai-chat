# 🗂️ AI‑Chat プロジェクト ― 完全 TODO シート  
**目的**: *フロントエンド (Next.js) / バックエンド (Express) / Docker / CI* のルーティング・実装・品質課題を **100 % 解決** する。  
**想定読者**: フルスタック開発者 + DevOps

---

## 📑 目次
1. [前提](#前提)  
2. [タスク表 (一覧)](#タスク表)  
3. [作業詳細](#作業詳細)  
   * 3‑A. フロントエンド再構築  
   * 3‑B. BFF (`route.ts`) 実装  
   * 3‑C. Express API 整備  
   * 3‑D. Docker & Env 設定  
   * 3‑E. CI / テスト / ドキュメント  
4. [完了条件](#完了条件)  

---

## 前提 <a id="前提"></a>

| 項目                     | 値                                             |
| ------------------------ | ---------------------------------------------- |
| **リポジトリルート**     | `ai-chat/` (mono‑repo)                         |
| **Workspaces**           | `ai-chat-ui`, `ai-chat-api`, `packages/shared` |
| **パッケージマネージャ** | `yarn`                                         |
| **Docker orchestration** | `docker-compose.yml`                           |
| **DB**                   | PostgreSQL (コンテナ)                          |
| **AUTH**                 | JWT (HTTP‑Only Cookie `session`)               |
| **環境変数**             | `.env`, `.env.docker`, `.env.test`             |

---

## タスク表 (一覧) <a id="タスク表"></a>

| Phase  | ID       | 説明                                                | 優先度 | Owner      |
| ------ | -------- | --------------------------------------------------- | ------ | ---------- |
| **0**  | P0‑1     | Mono‑repo + Workspaces セットアップ                 | ★★★    | BE/FE Lead |
| **1A** | FE‑1     | `app/api/**` → フォルダ＋`route.ts` リネーム        | ★★★    | FE         |
|        | FE‑2     | `src/server/**` & `src/shared/**` 追加              | ★★★    | FE         |
|        | FE‑3     | `use client` 不要箇所削除                           | ★★☆    | FE         |
| **1B** | BFF‑1    | Billing: plans / checkout / usage / overage-alerts  | ★★★    | FE         |
|        | BFF‑2    | Auth: login / logout / me                           | ★★★    | FE         |
|        | BFF‑3    | Widgets: list / detail / create                     | ★★☆    | FE         |
| **1C** | DATA‑1   | TanStack Query Provider 導入                        | ★★★    | FE         |
|        | DATA‑2   | `useBilling`, `useAuth`, `useWidgets` hooks         | ★★★    | FE         |
| **2**  | API‑1    | `routes/**` → controller / service 分離             | ★★★    | BE         |
|        | API‑2    | OpenAPI 3.1 spec 作成 + `express-openapi-validator` | ★★★    | BE         |
|        | API‑3    | CORS + Cookie 認証ミドルウェア統合                  | ★★★    | BE         |
| **3**  | DOCKER‑1 | マルチステージ build (ui/api) + Compose 更新        | ★★★    | DevOps     |
|        | DOCKER‑2 | `API_ORIGIN` 等 env 自動注入                        | ★★☆    | DevOps     |
| **4**  | CI‑1     | GitHub Actions: lint → test → build → push          | ★★★    | DevOps     |
|        | CI‑2     | Blue‑Green deploy workflow 更新                     | ★★☆    | DevOps     |
| **5**  | TEST‑1   | FE: MSW + Playwright, BE: supertest                 | ★★☆    | QA         |
| **6**  | DOC‑1    | ADR & README 更新                                   | ★★☆    | PM         |

---

## 作業詳細 <a id="作業詳細"></a>

### 3‑A. フロントエンド再構築

<details><summary>クリックで展開</summary>

#### 1. ルーティングリファクタ

| コマンド例                                                             | 目的                      |
| ---------------------------------------------------------------------- | ------------------------- |
| `git mv app/api/billing/checkout.ts app/api/billing/checkout/route.ts` | App Router 規約準拠       |
| `git mv app/api/companies/index.ts app/api/companies/route.ts`         | `/api/companies` GET/POST |

#### 2. サーバー専用 & 共有型

```bash
mkdir -p src/server src/shared
```

`src/shared/billing.ts`:

```ts
import { z } from 'zod';
export const BillingPlan = z.object({
  id: z.string(),
  name: z.string(),
  // …
});
export type BillingPlan = z.infer<typeof BillingPlan>;
export const BillingPlans = z.array(BillingPlan);
```

`src/server/auth.ts`:

```ts
import jwt from 'jsonwebtoken';
export function verify(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}
```

。</details>

---

### 3‑B. BFF (`route.ts`) 実装

<details><summary>クリックで展開</summary>

#### Billing Endpoints

| Path                          | Method    | Upstream                       | Code snippet                           |
| ----------------------------- | --------- | ------------------------------ | -------------------------------------- |
| `/api/billing/plans`          | GET       | `GET /v1/billing/plans`        | *see* `app/api/billing/plans/route.ts` |
| `/api/billing/checkout`       | POST      | `POST /v1/billing/checkout`    | idem                                   |
| `/api/billing/usage`          | GET       | `GET /v1/billing/usage?orgId=` | idem                                   |
| `/api/billing/overage-alerts` | GET / PUT | `/v1/billing/overage-alerts`   | idem                                   |

**テンプレ** (`_tpl_route.ts`):

```ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_BASE } from '@/src/server/env';

export async function <METHOD>(req: Request) {
  const jwt = cookies().get('session')?.value ?? '';
  const upstream = await fetch(API_BASE + '<ENDPOINT>', {/* … */});
  // Error → 502, Success → NextResponse.json()
}
```

#### Zod Validation layer

全 BFF で:

```ts
import { MySchema } from '@/src/shared/...';
const data = MySchema.parse(await upstream.json());
```

。</details>

---

### 3‑C. データ取得統一 (TanStack Query)

<details><summary>クリックで展開</summary>

1. `pnpm add @tanstack/react-query`  
2. `Providers.tsx` を `app/_components/Providers.tsx` に配置  
3. `app/layout.tsx` で `<Providers>` ラップ  
4. 各ページの `useEffect + useState + fetch` を **useQuery** に置換  
5. 静的ページは `export const revalidate = 3600` で ISR

。</details>

---

### 3‑D. Express API 整備

<details><summary>クリックで展開</summary>

#### 1. ディレクトリ階層

```
src/
├── routes/      ← ルーティング定義のみ
│   └── billing.route.ts
├── controllers/ ← HTTP レイヤ
│   └── billing.controller.ts
└── services/    ← ビジネスロジック
    └── billing.service.ts
```

#### 2. 例: `billing.route.ts`

```ts
import { Router } from 'express';
import * as ctl from '../controllers/billing.controller';
const r = Router();
r.get('/plans', ctl.getPlans);
r.post('/checkout', ctl.checkout);
export default r;
```

#### 3. OpenAPI & バリデータ

1. `openapi.yaml` に `/billing/plans` スキーマ定義  
2. `app.ts`:

```ts
import { OpenApiValidator } from 'express-openapi-validator';
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, '../openapi.yaml'),
    validateRequests: true,
    validateResponses: true,
  })
);
```

。</details>

---

### 3‑D. Docker & Env

<details><summary>クリックで展開</summary>

#### docker-compose.yml (抜粋)

```yaml
services:
  ui:
    build: ./ai-chat-ui
    environment:
      - API_ORIGIN=http://api:4000/v1
    ports: ["3000:3000"]

  api:
    build: ./ai-chat-api
    environment:
      - DATABASE_URL=postgres://...
      - JWT_SECRET=supersecret
    ports: ["4000:4000"]

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

1. `ai-chat-ui/Dockerfile` で `ARG NEXT_PUBLIC_API_PROXY=/api`  
2. `ai-chat-api/Dockerfile` をマルチステージ (builder → slim) 化

。</details>

---

### 3‑E. CI / テスト / ドキュメント

<details><summary>クリックで展開</summary>

#### GitHub Actions `ci.yml`

```yaml
name: CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        ports: ['5432:5432']
        env:
          POSTGRES_PASSWORD: password
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: '9' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint test build --filter=...
```

#### テスト雛形

* **FE ユニット**: `tests/unit/billing.spec.tsx` (Jest + React Testing Library + MSW)  
* **FE E2E**: `tests/e2e/billing.spec.ts` (Playwright)  
* **API ユニット**: `tests/unit/billing.service.test.ts` (Vitest)  
* **API 統合**: `tests/integration/billing.route.test.ts` (supertest + prisma test db)

。</details>

---

## 完了条件 <a id="完了条件"></a>

1. **UI**  
   * `/admin/[orgId]/billing` が CSR/SSR で動作  
   * Network タブ → `/api/billing/plans` 等が 200  
2. **API**  
   * `GET /v1/billing/plans` 仕様どおりレスポンス  
   * OpenAPI バリデーション pass  
3. **Docker**  
   * `docker compose up` → <http://localhost:3000> でアプリが表示  
4. **CI**  
   * `pnpm test` カバレッジ 80 %  
   * Actions で build + test Pass  
5. **ドキュメント**  
   * `docs/adr/0001-bff-in-nextjs.md` & `README` 更新  
   * `openapi.yaml` がリポジトリルートに存在  

---

> **備考**  
> 作業はフェーズ順に実行してください。途中で PR を分割し、タスクごとにレビューを受けることで品質を担保できます。  
> 本ドキュメントも PR ごとに更新し、最新状態を “Single Source of Truth” として維持してください。  
