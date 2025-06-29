# DevBoost Next.js × Express コーディング規約 v2025

> **目的** : すべてのモジュールを *可読性・型安全・変更容易性* の三本柱で統一し、バグの発生を最小化する。
>
> 本ドキュメントはリポジトリ直下の `docs/coding-style.md` にコミットし、必要に応じて Pull Request で更新する。

---

## 0. TL;DR チェックリスト

| 項目                              | MUST            | WHY                          |
| --------------------------------- | --------------- | ---------------------------- |
| **1 file = 1 責務**               | ✅               | 読みやすさ・変更範囲の局所化 |
| **型の単一ソース**                | ✅ `_schemas/**` | 型重複による不整合を防ぐ     |
| **page.tsx は 50 行以内**         | ✅               | ページは *配線* のみ         |
| **定数は \_config/**              | ✅               | マジックナンバー撲滅         |
| **モック = \_fixtures/ → seeds/** | ✅               | FE/BE で再利用・ドリフト防止 |

---

## 1. ディレクトリ構成

```
app/
├─ _components/        # 状態を持たない純粋 UI
├─ _hooks/             # TanStack Query / Zustand など状態管理
├─ _utils/             # 純粋関数
├─ _schemas/           # Zod | OpenAPI | JSON-Schema（単一ソース）
├─ _domains/           # 自動生成された型 + フロント固有補助型
├─ _config/            # 定数・スタイリングトークン
├─ _fixtures/          # Zod 由来のフェイクデータ（msw 用）
└─ (auth|org|…)/…/page.tsx  # ページ = Hook + UI の配線
backend/
├─ src/
│   ├─ routes/         # Express ルート
│   ├─ controllers/
│   ├─ models/
│   └─ seeds/          # _fixtures から import → DB へ投入
└─ prisma/
```

> **変更履歴**は `docs/CHANGELOG.md` で管理。

---

## 2. page.tsx のリファクタリング指針

| レイヤ | ファイル例                                 | 行数上限    | 責務                                                       |
| ------ | ------------------------------------------ | ----------- | ---------------------------------------------------------- |
| Page   | `(org)/admin/[orgId]/billing/page.tsx`     | **≤ 50 行** | ① ルート引数取得<br>② Hook 呼出<br>③ UI コンポーネント合成 |
| Hook   | `_hooks/billing/useBilling.ts`             | 100–150 行  | API fetch / キャッシュ / ローディング制御                  |
| UI     | `_components/feature/billing/PlanGrid.tsx` | 150 行      | JSX + Tailwind。状態は受け取るだけ                         |

* **禁止** : データ取得・状態管理ロジックを page.tsx へ直書き。
* **ページ固有ヘルパ**は `_hooks/…/useBillingPage.ts` として colocation。

---

## 3. 型定義 & スキーマ管理

### 3.1 単一ソース・オブ・トゥルース

* **Zod** を採用し **`_schemas/**`** に全ドメインのスキーマを作成。例 :

  ```ts
  // _schemas/auth.ts
  import { z } from "zod";
  export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(["user", "admin"]),
  });
  export type User = z.infer<typeof userSchema>;
  ```
* **重複禁止** : 既存の `_schemas/auth.ts` と `_schemas/user.ts` は **統合** し、`auth.ts` にまとめる。

### 3.2 型生成フロー

1. `pnpm generate:types` で以下を実行

   * **zod-to-ts** : `_schemas/**` → `_domains/**`
   * **openapi-typescript-codegen** : 必要なら OpenAPI → Swagger Client
2. \_domains に生成物 (`*.gen.ts`) が置かれ、フロントはそれを import。
3. バックエンド (Express) では同じスキーマを `zod` ミドルウェアでバリデーション。

> **注意** : `_domains` は *生成物 + フロント固有 Utility 型* に限定し、手書き型は最小限。

---

## 4. 定数 & コンフィグ

* **不変値 → `_config/**`** に集約し、import して使用。
* 例 :

  ```ts
  // _config/billing/plans.ts
  export const BILLING_PLANS = [
    { tier: "free", price: 0 },
    { tier: "pro", price: 29 },
  ] as const;
  ```
* **マジックナンバー禁止** – 直接数値や文字列を書かず定数を参照。

---

## 5. モックデータ & シード戦略

| フェーズ | 場所                   | 利用方法                           |
| -------- | ---------------------- | ---------------------------------- |
| 開発     | `_fixtures/**`         | `msw` で FE モック API / Storybook |
| 本番     | `backend/src/seeds/**` | Prisma / Sequelize seed script     |

* `_fixtures` は **\_schemas のスキーマ** を使って faker 生成 (`@faker-js/faker`).
* バックエンド `seed` スクリプトは `_fixtures` を import して DB へ投入 → モックと実データのドリフトが無くなる。

```ts
// backend/src/seeds/seed-users.ts
import { faker } from "@faker-js/faker";
import { userSchema } from "../../../../app/_schemas/auth";
```

---

## 6. 命名 & コーディング標準

* **コンポーネント** : `PascalCase.tsx`
* **Hook** : `useSomething.ts`
* **Boolean 変数** : `isXxx / hasXxx / canXxx`
* **Handler** : `handleSubmit`
* **環境変数** : `NEXT_PUBLIC_*` プレフィクスでフロントからのみ参照可能。

---

## 7. Lint / フォーマッタ / CI

* ESLint + Prettier + Stylelint = **Airbnb + Next + TypeScript** 拡張。
* 追加ルール

  * `max-lines-per-file`: 300
  * `complexity`: 10
  * `@typescript-eslint/no-misused-promises`
* Git Hooks

  * `pre-commit`: `lint-staged` で format & test
  * `pre-push`: `pnpm test:ci && pnpm build`

---

## 8. テスト

* **Unit** : Vitest / Jest + ts‑jest
* **Component** : React Testing Library + `@testing-library/jest-dom`
* **E2E** : Playwright (CI で `next build && playwright test`)
* **Storybook** : mock 状態 (loading / error / empty) を必ず作成

---

## 9. Git 運用

* Conventional Commits (`feat:`, `fix:`, `refactor:`…)
* PR ポリシー

  * 1 機能あたり **≤ 400 行**
  * UI 変更時はスクリーンショット必須
  * 型追加・リファクタは別 PR

---

## 10. 今後のアップデート手順

1. 本ドキュメントに変更が必要な場合、`docs/coding-style.md` を直接編集し PR 作成。
2. **`codestyle` ラベル** を付与。
3. レビューア全員が 👍 でマージ。

---

✅ **これで可読性とバグ耐性を両立する基盤が完成**。引き続き運用しながら改善していきましょ