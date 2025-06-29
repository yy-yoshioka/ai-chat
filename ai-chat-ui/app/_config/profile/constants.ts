export const PROFILE_ROUTES = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  BILLING: '/billing',
  WIDGETS: '/widgets',
  MESSAGES: '/messages',
  REPORTS: '/reports',
  API_DOCS: '/api-docs',
  HELP: '/help',
} as const;

export const QUICK_ACTIONS = [
  {
    title: 'ウィジェット管理',
    description: 'チャットウィジェットの設定と管理',
    href: PROFILE_ROUTES.WIDGETS,
    icon: 'widget',
    color: 'blue',
  },
  {
    title: 'メッセージ履歴',
    description: 'すべてのチャットメッセージを確認',
    href: PROFILE_ROUTES.MESSAGES,
    icon: 'message',
    color: 'green',
  },
  {
    title: 'レポート・分析',
    description: '利用状況とパフォーマンスを分析',
    href: PROFILE_ROUTES.REPORTS,
    icon: 'chart',
    color: 'purple',
  },
  {
    title: 'APIドキュメント',
    description: 'API統合のための技術ドキュメント',
    href: PROFILE_ROUTES.API_DOCS,
    icon: 'code',
    color: 'indigo',
  },
  {
    title: '料金プラン',
    description: 'プランの確認と変更',
    href: PROFILE_ROUTES.BILLING,
    icon: 'billing',
    color: 'yellow',
  },
  {
    title: 'ヘルプセンター',
    description: 'よくある質問とサポート',
    href: PROFILE_ROUTES.HELP,
    icon: 'help',
    color: 'gray',
  },
] as const;

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export const AVATAR_GRADIENT = 'from-blue-600 to-purple-600';
export const HERO_GRADIENT = 'from-blue-600 via-purple-600 to-indigo-700';