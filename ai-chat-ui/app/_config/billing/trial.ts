/**
 * 試用期間の終了日を “環境変数 or ここ” で切り替え
 * ------------------------------------------------
 * 例:
 *   - 本番 ➜ NEXT_PUBLIC_TRIAL_END を .env に設定
 *   - 開発 ➜ このファイルを直接書き換え
 */

export const TRIAL_DAYS: number = Number(process.env.NEXT_PUBLIC_TRIAL_DAYS) || 14;
