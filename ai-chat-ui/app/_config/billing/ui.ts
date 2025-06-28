/** Billing UI 固有のラベル & CSS マッピング */
export const PLAN_STATUS_LABEL: Record<'current' | 'trial' | 'available', string> = {
  current: '現在のプラン',
  trial: 'トライアル中',
  available: '14日間無料トライアル開始',
};

/** tailwind を組み立てる時に使う基底クラス */
const BASE_BTN = 'w-full py-3 px-4 rounded-lg font-medium transition-colors';

/** ステータス別ボタンスタイル */
export const PLAN_STATUS_STYLE: Record<'current' | 'trial' | 'available', string> = {
  current: `${BASE_BTN} bg-gray-100 text-gray-500 cursor-not-allowed`,
  trial: `${BASE_BTN} bg-green-100 text-green-700 cursor-not-allowed`,
  available: `${BASE_BTN} bg-blue-600 hover:bg-blue-700 text-white`,
};
