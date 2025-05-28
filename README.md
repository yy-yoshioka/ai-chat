# AI Chat Application

AI Chat ApplicationはNode.js/Express (API) と Next.js (UI) で構成されたチャットアプリケーションです。

## 構成

- **ai-chat-api**: Node.js/Express/TypeScript/Prisma (SQLite)
- **ai-chat-ui**: Next.js/TypeScript/TailwindCSS

## Docker での実行

### 本番環境

```bash
# アプリケーションのビルドと起動
docker-compose up --build

# バックグラウンドで実行
docker-compose up -d --build

# 停止
docker-compose down
```

### 開発環境（ホットリロード対応）

```bash
# 開発環境でのビルドと起動
docker-compose -f docker-compose.dev.yml up --build

# バックグラウンドで実行
docker-compose -f docker-compose.dev.yml up -d --build

# 停止
docker-compose -f docker-compose.dev.yml down
```

## アクセス

- **Frontend (UI)**: http://localhost:3000
- **Backend (API)**: http://localhost:3001

## 環境変数

### ai-chat-api

- `DATABASE_URL`: SQLiteデータベースのパス
- `JWT_SECRET`: JWT認証用のシークレットキー
- `NODE_ENV`: 実行環境 (development/production)

### ai-chat-ui

- `NEXT_PUBLIC_API_URL`: APIサーバーのURL
- `NODE_ENV`: 実行環境 (development/production)

## データベース

SQLiteデータベースは永続化ボリュームに保存されます：
- 本番環境: `api-data` ボリューム
- 開発環境: `api-dev-data` ボリューム

## 開発

### 開発環境の特徴

- ソースコードの変更が即座に反映される（ホットリロード）
- ボリュームマウントによりコンテナ内でのコード変更が可能
- 開発用の環境変数設定

### ログの確認

```bash
# 全サービスのログ
docker-compose logs -f

# 特定のサービスのログ
docker-compose logs -f ai-chat-api
docker-compose logs -f ai-chat-ui
```

### コンテナの管理

```bash
# 実行中のコンテナ確認
docker-compose ps

# コンテナに入る
docker-compose exec ai-chat-api sh
docker-compose exec ai-chat-ui sh

# イメージとボリュームの削除
docker-compose down -v --rmi all
```

## トラブルシューティング

### よくある問題

1. **ポートが既に使用されている**
   - `docker-compose.yml`のportsセクションで異なるポートを指定

2. **データベースエラー**
   - ボリュームを削除して再作成: `docker-compose down -v`

3. **ビルドエラー**
   - キャッシュをクリア: `docker-compose build --no-cache`

### データベースのリセット

```bash
# 開発環境のデータベースリセット
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
``` 