/** ───────── 画面メタ定義 ───────── */
export interface RouteMeta {
  title: string;
  desc: string;
}

export const ADMIN_META = {
  '/admin/dashboard': { title: 'ダッシュボード', desc: 'システム全体の状況を監視' },
  '/admin/faq': { title: 'FAQ管理', desc: 'よくある質問の作成・編集・削除' },
  '/admin/users': { title: 'ユーザー管理', desc: 'ユーザーアカウントの管理' },
  '/admin/org': { title: '組織管理', desc: '組織・テナントの管理と設定' },
  '/admin/chats': { title: 'チャット監視', desc: 'チャット履歴とパフォーマンスの監視' },
  '/admin/settings': { title: 'システム設定', desc: 'システム設定とコンフィグレーション' },
  '/admin/reports': { title: 'レポート', desc: '詳細なレポートと分析' },
  '/admin/logs': { title: 'ログ監視', desc: 'システムログとエラー監視' },
} as const satisfies Record<string, RouteMeta>;

export type AdminPath = keyof typeof ADMIN_META;

/** ルートに最も長くマッチするメタを取得（部分一致対応） */
export function resolveAdminMeta(pathname: string): RouteMeta {
  const hit = (Object.keys(ADMIN_META) as AdminPath[])
    .filter((p) => pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];

  return hit ? ADMIN_META[hit] : { title: '管理者パネル', desc: 'AI Chatシステムの管理' };
}
