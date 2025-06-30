#!/usr/bin/env bash
# scripts/slack-notify.sh
set -euo pipefail

# .env があれば読み込む
if [[ -f "${BASH_SOURCE%/*}/../.env" ]]; then
  set -a               # export 付きで読み込む
  . "${BASH_SOURCE%/*}/../.env"
  set +a
fi

if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
  echo "❌ SLACK_WEBHOOK_URL is not set"; exit 1
fi

# 一行メッセージ生成
MESSAGE="$*"
if [[ -z "$MESSAGE" ]]; then
  echo "Usage: $0 \"message to post\""; exit 1
fi

curl -s -X POST -H "Content-Type: application/json" \
     -d "{\"text\":\"$MESSAGE\"}" \
     "$SLACK_WEBHOOK_URL"
