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
✅  D‑1  Landing Page v2 (価値訴求 + ベータ招待フォーム)
✅  D‑2  Product Hunt 投稿素材 (サムネ・GIF・コピー)
✅  D‑3  Onboarding Email シリーズ (Day1, Day3, Day7)
✅  D‑4  Intercom 競合比較ブログ & ケーススタディ 3 本
✅  D‑5  FAQ / Help Center (Markdown → next-mdx)

---------------------------------------------------------
E. β リリース判定ゲート
---------------------------------------------------------
⬜  E‑1  100 社試用 / データ漏洩ゼロ / Billing 課金成功 ≥ 10
⬜  E‑2  平均応答時間 <800 ms & 99.9 % 稼働 7 日連続
⬜  E‑3  NPS 調査 (≥40) / 主要バグ Sev‑0 = 0


──────────────────────────────────────────────────────────────
F. ナレッジベース & FAQ オート応答      ★★ 完了 ★★
──────────────────────────────────────────────────────────────
✅  **F‑1  DB モデル追加**  
        • `KnowledgeBase` (orgId, title, desc)  
        • `Document` (kbId, sourceType, url, content, embedding)  
        • `FAQ` (orgId, question, answer, weight)  
        • `LinkRule` (orgId, triggerRegex, targetUrl, newTab)

✅  **F‑2  Prisma Migrate & Seed**  
        • サンプル KB & FAQ を seed script で投入  
        • CI に `prisma migrate deploy` を追加

✅  **F‑3  管理 UI /admin/org/[id]/knowledge**  
        • タブ: ①Docs ②FAQ ③FAQ候補 ④LinkRules  
        • ドラッグ&ドロップ PDF/URL 取込 → progress bar  
        • FAQ 並び替え・重み(weight) 編集

✅  **F‑4  Embedding Worker**  
        • Queue (BullMQ) + OpenAI `embeddings` API  
        • pgvector 拡張を RDS に有効化  
        • 再クロール用 Cron (毎日 04:00 UTC)

✅  **F‑5  RAG サービス**  
        • VecSearch (top‑k) → GPT‑4o prompt 合成  
        • Score 閾値 τ=0.82 未満は FAQ fallback  
        • Chat Flow を middleware で切替

✅  **F‑6  FAQ サジェスト生成**  
        • 未回答 or low‑conf messages を `unanswered` テーブルへ  
        • 週次バッチで TOP50 質問を抽出 → 管理 UI に「追加候補」表示  
        • 1‑click で FAQ 登録 & Embedding 再実行

✅  **F‑7  サードパーティ KB コネクタ**  
        • Zendesk Guide OAuth & Incremental Sync  
        • Intercom Articles API import  
        • Markdown/CSV 一括アップロード

✅  **F‑8  LinkRule 実装 & 計測**  
        • regex マッチでカードリンク挿入 (`<LinkCard …/>`)  
        • `event.link_clicked` を計測、CTR を Admin で表示

✅  **F‑9  セキュリティ & ガバナンス**  
        • 各 org の `vector` row‑level ACL 確認テスト  
        • PII フィルタリング (OpenAI Moderation) で Embedding 前検査


──────────────────────────────────────────────────────────────
G. ウィジェット & UI 拡張       ★★ 完了 ★★
──────────────────────────────────────────────────────────────
✅  G‑1  テーマビルダー GUI（カラーピッカー / 角丸 / 影）
✅  G‑2  カスタムランチャー API（任意 DOM → openChat()）
✅  G‑3  インライン埋め込み & マルチインスタンス
✅  G‑4  WCAG 2.1 AA 準拠 & キーボード操作
✅  G‑5  フルホワイトラベル / 複数ブランド切替

──────────────────────────────────────────────────────────────
H. エコシステム & 連携       ★★ 完了 ★★
──────────────────────────────────────────────────────────────
✅  H‑1  Zapier / Make コネクタ
✅  H‑2  Webflow & WordPress プラグイン
✅  H‑3  Public REST / GraphQL API & OAuth Portal
✅  H‑4  Webhook (message.created 等) + 署名検証
✅  H‑5  プラグイン SDK / マーケットプレイス α

──────────────────────────────────────────────────────────────
I. エンタープライズ & セキュリティ ★★ 完了 ★★
──────────────────────────────────────────────────────────────
✅  I‑1  SAML SSO & SCIM プロビジョニング
✅  I‑2  監査ログ & CSV / API Export
✅  I‑3  フィールドレベル暗号化 (BYOK)
✅  I‑4  API Rate Limit & WAF
✅  I‑5  SOC‑2 Type I 監査準備

──────────────────────────────────────────────────────────────
J. 可用性 & 拡張                 ★★ 完了 ★★
──────────────────────────────────────────────────────────────
✅  J‑1  マルチリージョン Active‑Active 構成
✅  J‑2  合成モニタリング 5 分毎
✅  J‑3  Chaos Test & Auto‑Heal
✅  J‑4  PWA & React‑Native SDK
✅  J‑5  課金プラン管理 UI + Overage 課金


──────────────────────────────────────────────────────────────
K. Advanced AI & Multimodal  ★★ NEW ★★
──────────────────────────────────────────────────────────────
⬜  K‑1  Conversation Summary API
        • GPT‑4o   model="agentic-summarize‑2025‑06"
        • Output: {intent, sentiment, next_steps[]}

⬜  K‑2  Copilot Suggestions (agent‑side)
        • Server streams 3 reply drafts + FAQ linkIDs
        • Accept/Reject → Fine‑tune preference store

⬜  K‑3  Voice & Multimodal Widget
        • Web Speech API fallback → Whisper‑V3
        • Toggle TTS (Edge‑Speech) + Auto‑language detect
        • Screen‑share / co‑browsing via WebRTC (iframe opt‑in)

⬜  K‑4  AI Governance Layer
        • Answer JSON {text, citations[], confidence}
        • Store in `ai_logs` table (sha256‑sig, expiry=3y)
        • Admin UI: filter <70 % conf → manual review queue

⬜  K‑5  AI Insights Hub
        • Realtime dashboard: CSAT vs Sentiment, FAQ gap cloud
        • Embedding drift monitor (cos‑sim <0.6 alert)

⬜  K‑6  Interactive Product Tour Builder
        • No‑code flow editor (steps, tooltip, video)
        • Trigger via chat command `/tour start`
        • Analytics: completion %, drop‑step

⬜  K‑7  Generative Email Replies
        • Shared inbox → GPT‑Reply w/ KB context
        • Human‑in‑loop diff viewer & approve

