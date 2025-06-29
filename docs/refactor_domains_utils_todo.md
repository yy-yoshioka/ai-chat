# 🗂️ _domains / _utils 導入 & 型統合 TODO

## 1. 目的
- Zod スキーマ (_schemas) を **型・バリデーションの単一真実源** に統一  
- ドメイン概念（Role, BillingPlan など）を **_domains** に整理  
- 純粋ロジック (hasRole, hasPermission) を **_utils** に隔離  
- `types/` フォルダを段階的に廃止し二重管理を解消

---

## 2. ディレクトリを作成

```bash
mkdir -p app/_domains/auth
mkdir -p app/_domains/billing
mkdir -p app/_utils
