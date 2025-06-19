## 🌐 ロールと画面階層

| レイヤ                          | 典型ユーザー       | パス構成                        | 役割                                     |
| ------------------------------- | ------------------ | ------------------------------- | ---------------------------------------- |
| **SuperAdmin (SaaS運営側)**     | あなた・運営チーム | `/root/*` ※今後実装予定         | 全テナント横断の監視・請求集計・障害対応 |
| **OrgAdmin (導入企業の管理者)** | 企業 A 社の担当者  | `/admin/*`                      | 自社ウィジェット / 課金 / FAQ / AI 設定  |
| **Member (企業内メンバー)**     | CS エージェント    | `/admin/chats`, `/admin/faq` 等 | 会話閲覧・Copilot 返信のみ               |
| **End-user (訪問者)**           | LP 来訪者          | ― (埋め込みウィジェット)        | チャット質問・回答のみ                   |

> **注意:**  
> 現在リポジトリに存在する `pages/admin/...` は **OrgAdmin** 向け UI です。  
> SaaS運営用の SuperAdmin ダッシュボードは別パスで追加予定です。

---

## 🗂️ OrgAdmin メニュー詳細

| サイドメニュー     | 対応ファイル                            | 機能概要                                        |
| ------------------ | --------------------------------------- | ----------------------------------------------- |
| **ダッシュボード** | `admin/dashboard.tsx`                   | チャット数・CSAT・Trial 残日数・トークン使用量  |
| **FAQ管理**        | `admin/org/[id]/knowledge.tsx`          | PDF/URL 取込・FAQ CRUD・未回答サジェスト        |
| **ユーザー管理**   | `admin/users.tsx`                       | orgAdmin / member 招待・ロール付与・SCIM 同期   |
| **組織管理**       | `admin/org/[id]/index.tsx` + サブページ | 課金プラン・SSO・Webhook・連携アプリ設定        |
| **チャット監視**   | `admin/chats.tsx`                       | リアルタイム会話一覧・タグ・転送                |
| **システム設定**   | `admin/settings.tsx`                    | ウィジェットテーマ・Voice/TTS・言語既定         |
| **レポート**       | `admin/reports.tsx`                     | 月次 PDF / CSV レポート生成                     |
| **ログ監視**       | `admin/logs.tsx`                        | Webhook 成功/失敗・AI ガバナンス・RateLimit 429 |

---

## 💳 14-Day Trial & 課金フロー

1. **Sign-up 完了 → `/onboarding/step-plan`**  
   - Stripe Checkout を発火（trial_period_days = 14, card 必須）  
2. **Success リダイレクト** `/billing/success`  
   - トライアル終了日と残日数を表示  
3. **Trial 中バッジ**  
   - `/admin` ヘッダー右側に “Trial 12 days left ▸ Upgrade”  
4. **プラン変更 & カード更新**  
   - `組織管理 › billing-plans` からいつでも可能  
5. **Trial 延長**  
   - 残 3 日を切ると “+7 日延長” ボタン (管理者のみ)  
6. **自動課金開始**  
   - 14 日後に Subscription が有効化 → 月次請求

---

## 🛠️ 今後追加予定 (SuperAdmin ダッシュボード)

- `/root/index.tsx` : ARR・MAU・エラー率
- `/root/orgs/[id]` : 各テナントの Usage メータと Impersonate ログイン
- `/root/incidents.tsx` : Sentry / UptimeRobot 集約表示
- RBAC middleware `requireRole('superAdmin')`

上記はロードマップ `YEAR-END_RELEASE_TODO_2025.md` の **R-1 / R-2** で実装予定です。
