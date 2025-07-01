export const FAQ_CONSTANTS = {
  LOADING_DELAY_MS: 1000,
  LINE_CLAMP_COUNT: 2,
} as const;

export const FAQ_STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
} as const;

export const FAQ_STATUS_LABELS = {
  active: 'アクティブ',
  inactive: '非アクティブ',
} as const;

export const FAQ_FILTER_ALL_LABEL = 'すべて';
