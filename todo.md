✅ = done / ⏳ = in‑progress / ⬜ = todo
---------------------------------------------------------
A. プロダクト基盤
---------------------------------------------------------
✅  A‑1  Postgres 版へ移行 (RDS / Cloud SQL)
✅  A‑2  Prisma マイグレーション自動化 CI ジョブ追加
✅  A‑3  SSE → WebSocket 切替 & フロント Hook 作成
✅  A‑4  組織テーブル + row‑level ACL ミドルウェア実装
✅  A‑5  Stripe Checkout & Webhook (月額 + 追加トークン)
✅  A‑6  Usage メーター (tokens, messages) → Billing 集計

---------------------------------------------------------
B. 体験 & 成果計測
---------------------------------------------------------
✅  B‑1  ウィジェットカスタムテーマ (ライト/ダーク/ブランド色)
✅  B‑2  埋め込みスニペット発行ページ `/embed`
✅  B‑3  イベント計測 (identify, message_sent, conversion)
✅  B‑4  Admin ダッシュボードで KPI 表示 (日次 WAU, ARPU)
✅  B‑5  多言語 UI (i18n/next-intl) + GPT‑4o 翻訳 API

---------------------------------------------------------
C. 信頼性・運用
---------------------------------------------------------
✅  C‑1  Playwright e2e: sign‑up→embed→first message
✅  C‑2  Sentry + Slack Alert (p95>1 s, error rate>1 %)
✅  C‑3  Blue‑Green デプロイワークフロー (Vercel Env)
✅  C‑4  Data retention policy & GDPR pages
✅  C‑5  Status page (UptimeRobot) & RSS incident feed

---------------------------------------------------------
D. マーケ & CS 準備
---------------------------------------------------------
⬜  D‑1  Landing Page v2 (価値訴求 + ベータ招待フォーム)
⬜  D‑2  Product Hunt 投稿素材 (サムネ・GIF・コピー)
⬜  D‑3  Onboarding Email シリーズ (Day1, Day3, Day7)
⬜  D‑4  Intercom 競合比較ブログ & ケーススタディ 3 本
⬜  D‑5  FAQ / Help Center (Markdown → next-mdx)

---------------------------------------------------------
E. β リリース判定ゲート
---------------------------------------------------------
⬜  E‑1  100 社試用 / データ漏洩ゼロ / Billing 課金成功 ≥ 10
⬜  E‑2  平均応答時間 <800 ms & 99.9 % 稼働 7 日連続
⬜  E‑3  NPS 調査 (≥40) / 主要バグ Sev‑0 = 0
