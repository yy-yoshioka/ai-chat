# ✅ 14-Day Trial 動線 追加タスク — TODO チェックリスト  
ファイル: `docs/todo-billing-entry.md`  
（Markdown チェックボックスで進捗管理できます）

---

<!-- ## 0. 事前セットアップ
- [ ] `.env` / Vercel に **STRIPE_SECRET_KEY** と **STRIPE_WEBHOOK_SECRET** を追加  
- [ ] Prisma `Organization` に `plan`, `trialEndAt`, `stripeSubscriptionId` が存在する -->

---

## 1. 画面実装
### 1-A  `/onboarding/step-plan.tsx`
- [x] 画面ファイルを新規作成
- [x] プランカード（Free / Pro / Enterprise）を配置
- [x] 「14 日無料で試す」ボタン → `/api/billing/checkout` 呼び出し
- [x] `signup.tsx` 成功後 `router.push('/onboarding/step-plan')`

### 1-B  Admin ヘッダー常駐バッジ
- [x] `components/AdminTopBar.tsx` に Trial 残日数バッジを追加  
  - "Trial **N** days left ▸ Upgrade"
- [x] バッジクリックで `/admin/org/[id]/billing-plans` へ遷移

### 1-C  `/admin/org/[id]/billing-plans.tsx`
- [x] Trial 状態ならページ上部に終了日アラートを表示
- [x] プラン変更時は再度 `/api/billing/checkout` を呼ぶ

### 1-D  `/onboarding/step-install.tsx`
- [x] Trial 残 3 日以下 && 未設置時に自動リダイレクト
- [x] 画面に「＋7 日延長」ボタン → `/api/trial/extend`

---

## 2. API 追加 / 改修
- [x] `/api/billing/checkout`  POST `{ priceId, orgId }` → Stripe Session
- [x] `/api/trial/extend`  POST `{ orgId }` → `trialEndAt += 7d` (OrgAdminのみ)

---

## 3. メール & リマインド
- [x] `jobs/email-drip.ts` を作成  
  - Day-1, Day-3, Day-7, Day-12 のメールテンプレ
- [x] `cron.yaml` に 04:00 UTC daily ジョブを追加

---

<!-- ## 4. テスト
### 4-A Playwright
- [ ] `tests/e2e/billing.spec.ts`  
  - Sign-up → step-plan へ遷移  
  - Checkout POST→Stripe URL 返却  
  - Success ページに終了日表示  
  - バッジが表示される

### 4-B Jest
- [ ] `tests/unit/extendTrial.test.ts`  
  - Admin ロールで 200 & +7 日  
  - Member ロールで 403

---

## 5. CI / デプロイ
- [ ] CI に新テストを組み込み（lint, test, build 全通過）
- [ ] Vercel Preview で Stripe Test キーを設定し動作確認
- [ ] QA 完了後 `main` へマージし本番 Stripe Key に切替

--- -->

### 完了条件
- [ ] 新規サインアップで必ず Checkout に到達
- [ ] Dashboard で Trial バッジが動く
- [ ] 延長ボタンで Trial 終了日が+7 日
- [ ] Stripe Webhook で `plan` が `pro` に更新される
