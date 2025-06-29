以下は **AI-Chat Front-End Coding Guidelines v1.1** です。
最新版のディレクトリ（tree 出力）と、これまでに一緒に整理してきた実装分割方針をすべて反映しました。
`docs/coding-guidelines.md` としてリポジトリに置けば、そのまま開発者ドキュメントとして利用できます。

---

## 0. 4 Layer 原則 – “どこに何を書くか” 早見表

| 階層        | 目的                               | ルート                                          | 代表例                                    |
| ----------- | ---------------------------------- | ----------------------------------------------- | ----------------------------------------- |
| **Config**  | 定数・トグル・静的 JSON            | `_config/**`                                    | `billing/plans.ts`, `navigation/admin/**` |
| **Domain**  | 型・ビジネスロジック・BFF 呼び出し | `_domains/**`                                   | `billing/plan.ts`, `auth/user.ts`         |
| **Utility** | UI 非依存関数                      | `_utils/**`                                     | `billing/trial-utils.ts`, `formatters.ts` |
| **UI**      | React コンポーネント               | `_components/**`<br/>(さらに feature / ui など) | `feature/billing/BillingPlans.tsx`        |

> **ページ本体** は app-router (`app/(auth)/login/page.tsx` 等) に置き、UI 層を呼び出すだけにする。

---

## 1. ディレクトリ命名ルール

| 種類                        | 形式                                                               | 例                                       |
| --------------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| ルート下                    | `_config`, `_domains`, `_utils`, `_mocks`, `_hooks`, `_components` | —                                        |
| UI 粒度                     | `ui/**` = Atomic, `feature/**` = Feature                           | `_components/feature/chat/ChatInput.tsx` |
| 小文字区切                  | snake\_case                                                        | `_utils/auth/redirect.ts`                |
| React Component / 型 / Enum | PascalCase                                                         | `PlanCard.tsx`, `type BillingPlan`       |
| 変数・関数                  | camelCase                                                          | `calcTrialInfo()`                        |
| env                         | UPPER\_SNAKE                                                       | `NEXT_PUBLIC_TRIAL_DAYS`                 |

---

## 2. Import の並び (eslint-plugin-import)

```jsonc
"import/order": ["error", {
  "groups": [
    "builtin",
    "external",
    "@/app/_config",
    "@/app/_utils",
    ["parent", "sibling", "index"]
  ],
  "newlines-between": "always",
  "alphabetize": { "order": "asc" }
}]
```

---

## 3. Config 階層の詳細

```
_config/
  billing/
    index.ts        // export * from './plans' './trial' ...
    plans.ts        // AVAILABLE_PLANS
    trial.ts        // TRIAL_DAYS 等
    ui.ts           // PLAN_STATUS_LABEL / STYLE マップ
  navigation/
    admin/{sidebar.ts, meta.ts}
    public/sidebar.ts
  auth/constants.ts // Regex, min length など
```

* **改定が頻繁な値**（価格・UI ラベル・閾値）はここに集中。
* “公開してよい env” は `NEXT_PUBLIC_*` にし、ここでラップして export。

---

## 4. Domain 階層の指針

| ファイル          | 責務                                      |
| ----------------- | ----------------------------------------- |
| `plan.ts`         | `interface BillingPlan`, Prisma‐enum 対応 |
| `subscription.ts` | Stripe 型 & API 呼び出し                  |
| `index.ts`        | barrel export (`export * from './plan'`)  |

> API(BFF) 呼び出し関数は **ここ** か `_hooks/**` に置き、UI から直接 fetch しない。

---

## 5. Utility 階層

```
_utils/
  billing/price-utils.ts   // formatPrice(), calcDiscount()
  billing/trial-utils.ts   // calcTrialInfo()
  navigation/nav-helpers.ts
  status/format.ts         // getStatusColor() 他
```

* **副作用なし**・**UI 依存なし** が条件。
* Jest 単体テストは同階層に `*.test.ts`.

---

## 6. Hooks 命名規則

| Hook            | 戻り値                               | ルート                               |
| --------------- | ------------------------------------ | ------------------------------------ |
| `useAuth`       | `{ user, authenticated, login() … }` | `_hooks/auth/useAuth.ts`             |
| `useBilling`    | `plans, subscription, …`             | `_hooks/billing/useBilling.ts`       |
| `useStatus`     | `systemStatus, incidents …`          | `_hooks/status/useStatus.ts`         |
| `usePublicMenu` | Public ナビアイテム配列              | `_hooks/navigation/usePublicMenu.ts` |

> “API 呼び出し + キャッシュ(SWR/React-Query)” は Hooks 層に実装し、UI 層は呼ぶだけにする。

---

## 7. UI 層 – 分割ガイド

```
_components/
  ui/            // ボタン・バッジ等 再利用可能 Atom
  feature/       // ドメイン単位 UI
  layout/        // AppShell・AdminLayout
  guard/         // HOC / Gate
  provider/      // Context.Provider
```

* **Feature → UI/Atomic** 方向にのみ依存。逆依存禁止。
* レンダリング制御 (Gate/HOC) は `guard/` にまとめて UI 層から呼ぶ。

---

## 8. ルーティング層 (app/)

* `/api/**` … Next14 Route Handlers。**BFF 専用**（db/外部 API と直接通信）。
* `(auth)` `(marketing)` `(org)` … **URL 名前空間ごと**にグループ。
* 各 `page.tsx` は「Hook でデータ取得 → Feature UI に props 渡し」だけを行う。

---

## 9. モック / Fixture

```
_mocks/organization.ts
_config/status/mock.ts
```

* `if (process.env.NODE_ENV === 'development')` でのみ import。
* Storybook でも同データを再利用。

---

## 10. env & 定数の実運用

```ts
// _config/billing/trial.ts
export const TRIAL_DAYS = Number(process.env.NEXT_PUBLIC_TRIAL_DAYS ?? 14);
```

* 期間を変更したい場合 → **env 変更だけで UI/Logic は変更不要**。
* ビルド時に Validate したい env は `next.config.js` の `envSchema` で zod 検証を推奨。

---

## 11. ESLint / Prettier / Husky

1. **eslint-next** プラグイン + ルール拡張
2. `prettier --write` を `lint-staged` で走らせる
3. `husky pre-commit` で `npm run lint && npm test`

---

## 12. テスト

| 階層                  | テスト種類                  | フレームワーク  |
| --------------------- | --------------------------- | --------------- |
| `_utils/**`           | ユニット                    | Jest            |
| `_components/ui`      | Snapshot / DOM              | RTL + Jest      |
| `_components/feature` | Storybook interaction + RTL | Storybook, Jest |
| `e2e/`                | E2E                         | Playwright      |

---

## 13. PR テンプレ チェック項目（抜粋）

* [ ] フォルダ配置はガイドラインに従っている
* [ ] **Config 値** は `_config/**` に追加したか
* [ ] UI から直接 fetch していない (Hook 経由か?)
* [ ] import 順序 / eslint pass
* [ ] Storybook or Jest テスト追加済み
* [ ] モックデータは `_mocks/**` に隔離
* [ ] ドキュメント更新（必要なら `docs/**`）

---

このガイドラインを基に **実装レビュー ➜ CI 強制 ➜ ナレッジ共有** を回すことで、
新メンバーでも迷わずディレクトリ配置・分割方針を理解できます。
