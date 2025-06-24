# 🚀 Frontend 完全 TODO（Next.js App Router + Yarn）

このシートは **フロントエンド (`ai-chat-ui`)** の残課題を 100 % 解消するための最終タスク一覧です。  
`yarn` を前提としてコマンドを記載しています。チェックボックスを埋めながら進めてください。

---

## 📑 一覧表

| Phase | ID          | Todo                                                       | 完了条件 |
| ----- | ----------- | ---------------------------------------------------------- | -------- |
| **A** | **ROUTE‑1** | **未リネーム 5 ルートを `route.ts` 形式に変更**<br>```bash |
# chat widget
git mv app/api/chat/widget/[widgetKey].ts app/api/chat/widget/[widgetKey]/route.ts
# widgets collection & detail
git mv app/api/widgets/index.ts app/api/widgets/route.ts
mkdir -p app/api/widgets/[widgetKey]
git mv app/api/widgets/[widgetKey].ts app/api/widgets/[widgetKey]/route.ts
# trial extend
git mv app/api/trial/extend.ts app/api/trial/extend/route.ts
# status rss
git mv app/api/status/rss.ts app/api/status/rss/route.ts
``` | `yarn build` で `.next/server/app/api/**` に **route.js** が生成される |
|  | **ROUTE‑2** | **API 以外のコード移動**<br>`git mv app/api/cron app/jobs && git mv app/api/test app/tests` | 本番ビルドで **cron/test 関数がデプロイされない** |
| **B** | **CONST‑1** | **API_BASE 定数を 1 箇所に統合**<br>1. `app/_lib/config.ts` を新規作成<br>```ts
/** フロントエンド(BFF含む)共通 API URL */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://ai-chat-api:3001';
```
2. 既存 `server/env.ts` (サーバーコンポーネント用) は変更しない | 全 BFF が `config.ts` を import |
|  | **CONST‑2** | **BFF 内の直書き URL/ENV を除去**<br>例: `api/companies/route.ts` を下記に修正 | `grep -R "NEXT_PUBLIC_API_URL" app/api | wc -l` → **0** |
| **C** | **BFF‑1** | **`api/companies/route.ts` を共通テンプレ化**<br>```ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/_lib/config';

export async function GET() {
  const jwt = cookies().get('session')?.value ?? '';
  const res = await fetch(`${API_BASE_URL}/api/companies`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
``` | `/api/companies` が 200 を返す |
|  | **BFF‑2** | **他の BFF (`billing/*`, `widgets/*`, `trial/*` 等) も `config.ts` を使用** | ソースに生 URL 文字列なし |
| **D** | **TYPE‑1** | **`shared/` に足りない型を追加 (Widget, Trial)**<br>例: `shared/widget.ts`<br>```ts
import { z } from 'zod';
export const Widget = z.object({ id: z.string(), name: z.string() /* … */ });
export type Widget = z.infer<typeof Widget>;
```
`shared/index.ts` で再エクスポートして IDE 補完強化 | 新ルートで `Widget.parse(...)` 成功 |
| **E** | **QUERY‑1** | **React‑Query 導入 & Provider 設置**<br>`yarn add @tanstack/react-query` → `Providers.tsx` 作成 → `app/layout.tsx` でラップ | ページロード時に react-query DevTools でキャッシュ確認 |
|  | **QUERY‑2** | **既存 fetch+useEffect をフック化** (`useBilling`, `useCompanies`, `useWidgets`) | Network タブで同一 API が 1 回のみ |
| **F** | **CI‑1** | **API ルート命名規約チェック (lint:routes)**<br>```json
"scripts": {
  "lint:routes": "grep -R --include=*.ts -l 'app/api' | grep -v 'route.ts$' && (echo 'Non‑route file detected' && exit 1) || true"
}
```<br>GitHub Actions に `yarn lint:routes` を追加 | 規約違反コミットで CI fail |

---

## 🗂️ ディレクトリ構成（変更後）

```
ai-chat-ui/
├── app/
│   ├── _lib/config.ts      # ★ フロント/API 共通 URL
│   ├── api/                # すべて route.ts 形式
│   │   └── ...             # (cron/test は移動済)
│   ├── jobs/               # バックグラウンドジョブ
│   └── tests/              # API モックや E2E
├── shared/                 # ※ 既存フォルダを継続利用
│   ├── auth.ts
│   ├── billing.ts
│   ├── widget.ts           # ★ 追加
│   └── trial.ts            # ★ 追加
└── server/
    └── env.ts              # サーバー側 API_BASE (変更なし)
```

---

## 🏁 Definition of Done

- [ ] `yarn build && yarn start` → 404/500 なし  
- [ ] `/api/**` の全エンドポイントが **route.ts** 構成  
- [ ] `app/api/**` に生 URL / `NEXT_PUBLIC_API_URL` 直参照が 0  
- [ ] `yarn lint:routes` Green  
- [ ] TypeScript チェック `yarn tsc --noEmit` Pass  
- [ ] React‑Query 経由でキャッシュ確認済み  

---

### 📌 メモ

* **shared/** フォルダは現行の場所のまま（`src/` を増やさない）。  
* **server/env.ts** と **app/_lib/config.ts** は **用途を分離**：  
  * 前者 = サーバーコンポーネント / Server Actions 用  
  * 後者 = BFF 及び CSR で使用  
* **yarn** スクリプトを統一 (`yarn build`, `yarn dev`, `yarn test`)  
* CI の Node キャッシュも `actions/setup-node` + `cache: yarn` に変更すること
