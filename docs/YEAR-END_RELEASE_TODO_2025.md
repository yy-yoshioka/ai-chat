# YEAR-END_RELEASE_TODO_2025.md
_〆切 : 2025-12-31 Code Freeze_

✅ = done / ⏳ = in-progress / ⬜ = todo  

---


## A. 課金 & 14-Day Trial フロー ★最優先
| 状態 | ID      | タスク                                                                                          | 目安  |
| ---- | ------- | ----------------------------------------------------------------------------------------------- | ----- |
| ✅    | **A-1** | **Stripe Checkout** `/api/billing/checkout.ts`<br>‒ `trial_period_days = 14` / card 必須        | 0.5 d |
| ✅    | **A-2** | **Stripe Webhook** `/api/billing/webhook.ts`<br>‒ handle `invoice.paid`, `subscription.updated` | 0.5 d |
| ✅    | **A-3** | 成功 `/billing/success.tsx` & 失敗 `/billing/cancel.tsx` ページ                                 | 0.3 d |
| ✅    | **A-4** | プラン UI `billing-plans.tsx` (Trial 残日数/自動課金日表示)                                     | 0.4 d |
| ✅    | **A-5** | **Trial 延長エンドポイント** `/api/trial/extend` (+7 d)<br>‒ 管理者のみ                         | 0.2 d |
| ✅    | **A-6** | **KPI ダッシュカード** (Trial→Paid / Churn / LTV)                                               | 0.3 d |
| ✅    | **A-7** | Usage → `usage_record.create` Cron 2 h                                                          | 0.3 d |

---

## B. Trial ライフサイクル Email & 通知

| 状態 | ID      | タスク                                            | 目安  |
| ---- | ------- | ------------------------------------------------- | ----- |
| ⬜    | **B-1** | Day-1 Onboarding Email (Widget設置チュートリアル) | 0.2 d |
| ⬜    | **B-2** | Day-3 KBアップロード促進 Email                    | 0.2 d |
| ⬜    | **B-3** | Day-7 In-app Banner & Email（価値可視化）         | 0.2 d |
| ⬜    | **B-4** | Day-12 Re-engage + プラン選択 CTA                 | 0.2 d |
| ⬜    | **B-5** | **Automations Job** : `/cron/email-drip`          | 0.2 d |

---

## C. 法人別カスタム応答

| 状態 | ID      | タスク                                                    | 目安  |
| ---- | ------- | --------------------------------------------------------- | ----- |
| ⬜    | **C-1** | Prisma : `OrgPromptConfig` / `OrgDynamicVars` テーブル    | 0.3 d |
| ⬜    | **C-2** | CRUD API `/api/org/:id/prompt`  `/vars`                   | 0.5 d |
| ⬜    | **C-3** | Prompt Assembler (変数展開 + tone)                        | 0.3 d |
| ⬜    | **C-4** | 管理 UI `custom-responses.tsx`（Editor + Vars + Preview） | 0.7 d |
| ⬜    | **C-5** | Playwright テスト ORG-VAR-01/02                           | 0.2 d |

---

## D. ウィジェット・テーマ テナント分離

| 状態 | ID      | タスク                                | 目安  |
| ---- | ------- | ------------------------------------- | ----- |
| ⬜    | **D-1** | `themes` → `org_theme` へマイグレート | 0.3 d |
| ⬜    | **D-2** | API `/api/org/:id/theme` GET/PUT      | 0.2 d |
| ⬜    | **D-3** | Builder 保存先切替 + org 選択         | 0.3 d |

---

## E. PersonaLens（Fit / Intent Score）β

| 状態 | ID      | タスク                             | 目安  |
| ---- | ------- | ---------------------------------- | ----- |
| ⬜    | **E-1** | `VisitorScore` テーブル            | 0.2 d |
| ⬜    | **E-2** | Cloudflare Worker `/edge/score.ts` | 0.7 d |
| ⬜    | **E-3** | API `/api/visitor-score` 保存      | 0.2 d |
| ⬜    | **E-4** | Widget JS `identifyScore()` 実装   | 0.2 d |
| ⬜    | **E-5** | テスト SCORE-01/02                 | 0.2 d |

---

## F. DealPilot（Sales Email）α

| 状態 | ID      | タスク                                 | 目安  |
| ---- | ------- | -------------------------------------- | ----- |
| ⬜    | **F-1** | `EmailCampaign` テーブル               | 0.2 d |
| ⬜    | **F-2** | `/api/email/draft.ts`（3 Drafts 生成） | 0.5 d |
| ⬜    | **F-3** | `/api/email/send.ts`（送信処理）       | 0.3 d |
| ⬜    | **F-4** | UI `email-replies.tsx`（Diff 承認）    | 0.8 d |
| ⬜    | **F-5** | テスト EMAIL-03                        | 0.2 d |

---

## G. 運用 & セキュリティ強化

| 状態 | ID      | タスク                                            | 目安  |
| ---- | ------- | ------------------------------------------------- | ----- |
| ⬜    | **G-1** | SSE `/chat` Rate-Limit (token bucket)             | 0.2 d |
| ⬜    | **G-2** | RDS nightly snapshot & S3 Copy Job                | 0.3 d |
| ⬜    | **G-3** | `delete_soft_archive_job.ts`（90 日旧データ削除） | 0.3 d |
| ⬜    | **G-4** | ボタン色コントラスト改善                          | 0.2 d |

---

## H. CI / テスト拡充

| 状態 | ID      | タスク                                    | 目安  |
| ---- | ------- | ----------------------------------------- | ----- |
| ⬜    | **H-1** | 新 Smoke ケース(BILL-03 ほか)を CI 組込み | 0.4 d |
| ⬜    | **H-2** | Stripe Webhook & Edge Worker Mock テスト  | 0.3 d |

---

### 工数合計  
**≈ 12 人日**  
*(フルスタック 1 名 + QA/Ops 0.5 名、2 週間スプリント)*  

**14 日 Trial＋カード必須** 導線と **法人別応答** が完成すれば、  
正式 GA ＋ アップセル販売まで一直線です。
