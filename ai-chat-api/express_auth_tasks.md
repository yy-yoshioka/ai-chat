# 🔐 Express 認証関連機能追加タスク

---

## ✅ Step 1: 認証ルートを作成

- [ ] `routes/auth.ts` を作成し、以下のエンドポイントを定義
  - POST `/auth/login`
  - POST `/auth/signup`
  - GET `/auth/me`

---

## ✅ Step 2: JWT生成・検証処理を作成

- [ ] `utils/jwt.ts` を作成し、`signToken`, `verifyToken` を定義
- [ ] JWTを HTTP-Only Cookie として `res.cookie()` で保存

---

## ✅ Step 3: 認証ミドルウェアを追加

- [ ] `middleware/auth.ts` を作成し、CookieからJWTを検証し `req.user` を付与

---

## ✅ Step 4: 保護ルートを作成

- [ ] `/auth/me` に `authMiddleware` を適用してログイン状態を確認

---

## ✅ Step 5: その他の準備

- [ ] `.env.example` に `JWT_SECRET` を追加
- [ ] `README.md` にCookieベースの認証フローを追記
