// 状態 → Tailwind 色クラス
export const STATUS_COLOR = {
  operational: {
    dot: 'bg-green-500',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
  },
  degraded: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  partial_outage: {
    dot: 'bg-orange-500',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800',
  },
  major_outage: { dot: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
} as const;
