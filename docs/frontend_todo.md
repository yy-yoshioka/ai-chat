# 🛠️ Frontend Migration TODO (Next.js App Router + BFF)

このドキュメントは **Phase 1** の 3 大タスク  
1‑A **ディレクトリ & ルーティング整備**  
1‑B **BFF (`route.ts`) 実装**  
1‑C **データ取得統一 (TanStack Query)**  

を“**具体的なファイル操作・コードスニペット**”レベルまで落とし込んだ実行シートです。  
チェックボックスを埋めながら進めてください。  

---

## ⏱️ 目安工数

| Task      | 想定工数 |
| --------- | -------- |
| 1‑A       | 0.5 日   |
| 1‑B       | 1.0 日   |
| 1‑C       | 0.5 日   |
| **Total** | **2 日** |

---

## 1‑A. ディレクトリ & ルーティング整備

### 1‑A‑1. `app/api` をフォルダ＋`route.ts` 形式へ統一

| 旧パス                        | 新パス                              | コマンド例                                                             |
| ----------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| `app/api/billing/checkout.ts` | `app/api/billing/checkout/route.ts` | `git mv app/api/billing/checkout.ts app/api/billing/checkout/route.ts` |
| `app/api/billing/webhook.ts`  | `app/api/billing/webhook/route.ts`  | 同上                                                                   |
| `app/api/companies/index.ts`  | `app/api/companies/route.ts`        | `git mv app/api/companies/index.ts app/api/companies/route.ts`         |

> **Point:** App Router は _必ず_ `route.ts` / `route.js` ファイルのみを API として認識します。

---

### 1‑A‑2. サーバー & 共有ユーティリティのフォルダを追加

```
ai-chat-ui/
└── src/
    ├── server/           # server‑only util
    │   └── auth.ts       # JWT decode など
    └── shared/           # 型 & Zod schema
        ├── billing.ts
        └── auth.ts
```

1. `mkdir -p src/server src/shared`  
2. Prisma 型から `BillingPlan`, `UsageData` などを `src/shared/billing.ts` へエクスポート  
3. UI / BFF / Express すべて `import { BillingPlan } from '@/src/shared/billing'` で統一

---

### 1‑A‑3. 不要な `use client` を削除

| ファイル                                   | 行番号   | 対応                                  |
| ------------------------------------------ | -------- | ------------------------------------- |
| `app/(org)/admin/[orgId]/billing/page.tsx` | 1 行目   | コメントアウト（Server Component 化） |
| `app/layout.tsx`                           | **残す** | Global state 使用箇所があるため       |

---

## 1‑B. BFF (`route.ts`) 実装

### 1‑B‑1. 共通定数

`src/server/env.ts`

```ts
export const API_BASE = process.env.API_ORIGIN ?? 'http://api:4000/v1';
```

### 1‑B‑2. Billing BFF

#### `app/api/billing/plans/route.ts`

```ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { BillingPlans } from '@/src/shared/billing';
import { API_BASE } from '@/src/server/env';

export const revalidate = 60;        // ISR: 60 秒

export async function GET() {
  const jwt = cookies().get('session')?.value ?? '';
  const res = await fetch(`${API_BASE}/billing/plans`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ message: 'Upstream error' }, { status: res.status });
  }

  const raw = await res.json();
  const data = BillingPlans.parse(raw);      // Zod validation
  return NextResponse.json(data);
}
```

#### `app/api/billing/checkout/route.ts`

```ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_BASE } from '@/src/server/env';

export async function POST(req: Request) {
  const jwt = cookies().get('session')?.value ?? '';
  const payload = await req.json();

  const res = await fetch(`${API_BASE}/billing/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ message: text }, { status: res.status });
  }

  const json = await res.json();
  return NextResponse.json(json);        // sessionUrl など
}
```

> **TIP**: 他のエンドポイントも同様パターンで 1 route ≤ 30 行を目指す。

---

## 1‑C. データ取得統一 (TanStack Query)

### 1‑C‑1. 依存追加

```bash
pnpm add @tanstack/react-query
```

### 1‑C‑2. Provider 設置

`app/_components/Providers.tsx`

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

`app/layout.tsx`

```tsx
import Providers from '@/app/_components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 1‑C‑3. カスタムフック化

`app/(org)/admin/[orgId]/billing/_hooks/useBilling.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { BillingPlan, UsageData } from '@/src/shared/billing';

export function useBilling(orgId: string) {
  return useQuery({
    queryKey: ['billing', orgId],
    queryFn: async (): Promise<{
      plans: BillingPlan[];
      usage: UsageData;
    }> => {
      const [plans, usage] = await Promise.all([
        fetch(`/api/billing/plans`).then(r => r.json()),
        fetch(`/api/billing/usage?orgId=${orgId}`).then(r => r.json()),
      ]);
      return { plans, usage };
    },
    staleTime: 60_000,
  });
}
```

### 1‑C‑4. ページ側の置換

`app/(org)/admin/[orgId]/billing/page.tsx` （抜粋）

```tsx
// Before
// const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
// useEffect(() => { fetch(...) }, []);

// After
import { useBilling } from './_hooks/useBilling';

export default function BillingPage({ params }: { params: { orgId: string } }) {
  const { data, isLoading } = useBilling(params.orgId);
  if (isLoading) return <LoadingSpinner />;

  const { plans, usage } = data!;
  // 以下は plans, usage をそのまま表示
}
```

## ✅ 完了チェックリスト

- [ ] 1‑A‑1 ファイルリネーム完了
- [ ] 1‑A‑2 `src/server` `src/shared` 追加
- [ ] 1‑A‑3 不要な `use client` 削除
- [ ] 1‑B Billing ルート GET/POST 実装
- [ ] 1‑B Auth ルート POST 実装
- [ ] 1‑C Provider 追加
- [ ] 1‑C useBilling フック実装
- [ ] 1‑C ページ置換＆ネットワークリクエスト 1 回化
- [ ] Docker `API_ORIGIN` 環境変数設定
