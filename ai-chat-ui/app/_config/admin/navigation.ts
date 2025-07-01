export interface SidebarItem {
  title: string;
  path: string;
  icon: string;
}

export function createSidebarItems(orgId: string): SidebarItem[] {
  return [
    {
      title: 'ダッシュボード',
      path: `/admin/${orgId}/dashboard`,
      icon: '📊',
    },
    {
      title: 'ウィジェット',
      path: `/admin/${orgId}/widgets`,
      icon: '🧩',
    },
    {
      title: 'チャット',
      path: `/admin/${orgId}/chats`,
      icon: '💬',
    },
    {
      title: 'FAQ管理',
      path: `/admin/${orgId}/faq`,
      icon: '❓',
    },
    {
      title: 'ユーザー管理',
      path: `/admin/${orgId}/users`,
      icon: '👥',
    },
    {
      title: 'レポート',
      path: `/admin/${orgId}/reports`,
      icon: '📈',
    },
    {
      title: '請求・利用状況',
      path: `/admin/${orgId}/billing`,
      icon: '💳',
    },
    {
      title: 'ログ監視',
      path: `/admin/${orgId}/logs`,
      icon: '📋',
    },
    {
      title: 'Webhook',
      path: `/admin/${orgId}/webhooks`,
      icon: '🔗',
    },
    {
      title: 'システムヘルス',
      path: `/admin/${orgId}/system-health`,
      icon: '🏥',
    },
    {
      title: '設定',
      path: `/admin/${orgId}/settings`,
      icon: '⚙️',
    },
  ];
}

export function getPageTitle(pathname: string): string {
  if (pathname.includes('/dashboard')) return 'ダッシュボード';
  if (pathname.includes('/widgets')) return 'ウィジェット管理';
  if (pathname.includes('/faq')) return 'FAQ管理';
  if (pathname.includes('/users')) return 'ユーザー管理';
  if (pathname.includes('/chats')) return 'チャット監視';
  if (pathname.includes('/reports')) return 'レポート';
  if (pathname.includes('/billing')) return '請求・利用状況';
  if (pathname.includes('/logs')) return 'ログ監視';
  if (pathname.includes('/webhooks')) return 'Webhook管理';
  if (pathname.includes('/system-health')) return 'システムヘルス';
  if (pathname.includes('/settings')) return '設定';
  return '管理者パネル';
}

export function getPageDescription(pathname: string): string {
  if (pathname.includes('/dashboard')) return 'システム全体の状況を監視';
  if (pathname.includes('/widgets')) return 'チャットウィジェットの作成・管理';
  if (pathname.includes('/faq')) return 'よくある質問の作成・編集・削除';
  if (pathname.includes('/users')) return 'ユーザーアカウントの管理';
  if (pathname.includes('/chats')) return 'チャット履歴とパフォーマンスの監視';
  if (pathname.includes('/reports')) return '詳細なレポートと分析';
  if (pathname.includes('/billing')) return '請求情報と利用状況の確認';
  if (pathname.includes('/logs')) return 'システムログとエラー監視';
  if (pathname.includes('/webhooks')) return 'Webhook設定と送信ログの管理';
  if (pathname.includes('/system-health'))
    return 'システムパフォーマンス、インシデント、サービスヘルスの監視';
  if (pathname.includes('/settings')) return '組織設定の管理';
  return 'AI Chatシステムの管理';
}
