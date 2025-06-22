# Router Refactor Plan — Admin → `/admin/{orgId}/…`
> Version: 2025-06-22 11:51 UTC

---

## 1. ディレクトリ再編（Next.js App Router 想定）

| 作業                                                                                  | 詳細 |
| ------------------------------------------------------------------------------------- | ---- |
| [x] `app/` ディレクトリを新設し App Router へ段階移行 (`pages/` 併存可)               |
| [x] **動的セグメント** `app/admin/[orgId]/` を作成し `<Sidebar>` 共通レイアウトを配置 |
| [x] App Router 用の `middleware.ts` ひな形を追加（§3 で実装）                         |

---

## 2. 旧 URL → 新 URL 移設チェックリスト

| 旧 URL (pages)          | 新 URL (app)                | 作業内容         | 完了 |
| ----------------------- | --------------------------- | ---------------- | ---- |
| `/admin/dashboard`      | `/admin/{orgId}/dashboard`  | ファイル移動     | [x]  |
| `/admin/chats`          | `/admin/{orgId}/chats`      | ファイル移動     | [x]  |
| `/admin/logs`           | `/admin/{orgId}/logs`       | ファイル移動     | [x]  |
| `/admin/users`          | `/admin/{orgId}/users`      | ファイル移動     | [x]  |
| `/admin/reports`        | `/admin/{orgId}/reports`    | ファイル移動     | [x]  |
| `/admin/faq`            | `/admin/{orgId}/faq`        | ディレクトリ移動 | [x]  |
| `/admin/faq/create`     | `/admin/{orgId}/faq/create` | ファイル移動     | [x]  |
| `/admin/faq/[id]`       | `/admin/{orgId}/faq/[id]`   | ファイル移動     | [x]  |
| `/admin/org/[id]/index` | `/admin/{orgId}/dashboard`  | 統合削除         | [x]  |
| `/admin/org/[id]/*`     | `/admin/{orgId}/*`          | 各ファイル移動   | [x]  |

---

## 3. ミドルウェアとリダイレクト

### 3-A. `middleware.ts`
- [x] 未認証時: `/signin?next=…` にリダイレクト
- [x] `/admin` 直下アクセス時: `defaultOrgId` を付与して `/admin/{orgId}/dashboard` へ
- [x] 旧パス互換リダイレクトを 301/302 で追加

### 3-B. `next.config.js`
- [x] `redirects` 配列で旧→新パスを 301 登録

---

## 4. 内部リンク・API 更新

- [x] `<Link>` と `router.push()` を新パスへ変更
- [x] `Sidebar` メニュー URL 更新
- [x] React Query/SWR キーに `orgId` を含める
- [x] `axios` 基底パスに `orgId` 追加

---

## 5. コンポーネント修正

- [x] `requireRole` HOC に `orgId` 引数を追加
- [x] `useCurrentOrg()` フック作成
- [x] 必要なら `/org-selector` ページ追加

---

## 6. SuperAdmin (オプション)

| 新 URL                  | ファイル                   | 完了 |
| ----------------------- | -------------------------- | ---- |
| `/superadmin/tenants`   | `app/superadmin/tenants`   | [x]  |
| `/superadmin/metrics`   | `app/superadmin/metrics`   | [x]  |
| `/superadmin/incidents` | `app/superadmin/incidents` | [x]  |


---

### ✅ ゴール達成
- [x] すべての管理画面が `/admin/{orgId}/…` に統一
- [x] 旧 URL は 301 転送
- [x] App Router への完全移行完了
- [x] SuperAdmin セクション実装完了
