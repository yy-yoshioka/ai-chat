# 🔐 Next.js 認証関連機能追加タスク

---

## ✅ Step 1: 認証状態取得のためのAPIルートを追加

- [x] `/pages/api/me.ts` を作成し、CookieからJWTを読み取りユーザー情報を返す
- [x] JWTが無効なら401を返す

---

## ✅ Step 2: API呼び出しラッパーを作成

- [x] `lib/api.ts` を作成し、`fetch` または `axios` で `credentials: 'include'` を付けてリクエストする共通関数を定義

---

## ✅ Step 3: 認証状態を管理するHookを作成

- [x] `hooks/useAuth.ts` を作成し、`/api/me` を呼び出してユーザー情報を管理するHookを実装

---

## ✅ Step 4: 認証済みユーザーのみページを表示するHOCを作成

- [x] `lib/withAuth.tsx` を作成し、`useEffect` で `useAuth()` を使用して未認証なら `/login` にリダイレクト

---

## ✅ Step 5: middleware.ts でルート保護（Next.js 13+）

- [x] プロジェクトルートに `middleware.ts` を作成
- [x] CookieからJWTを検証し、未認証なら `/login` にリダイレクト

---

## ✅ Step 6: その他の準備

- [x] `.env.example` に `JWT_SECRET` を追加
- [x] `README.md` に認証フローと使い方を追記
