export const REPORT_CONSTANTS = {
  LOADING_DELAY_MS: 1000,
  MAX_CHART_HEIGHT_PX: 200,
  SATISFACTION_MAX_RATING: 5,
  DATE_RANGE_OPTIONS: [
    { value: '7days', label: '過去7日間' },
    { value: '30days', label: '過去30日間' },
    { value: '90days', label: '過去90日間' },
  ] as const,
} as const;

export const REPORT_ICONS = {
  totalUsers: '👥',
  totalChats: '💬',
  avgSatisfaction: '⭐',
  responseTime: '⚡',
} as const;

export const REPORT_COLORS = {
  totalUsers: 'blue',
  totalChats: 'green',
  avgSatisfaction: 'yellow',
  responseTime: 'purple',
} as const;
