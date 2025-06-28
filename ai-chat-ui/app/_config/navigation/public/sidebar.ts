/**
 * パブリック／ログイン後を問わず使うトップナビの静的定義
 * 「何を出すか」だけを保持し、ロジックは hook 側へ委譲する
 */

export interface PublicNavItem {
  href: string;
  label: string;
  /** true の場合は認証済みユーザーのみに表示 */
  requiresAuth?: boolean;
  /** 管理画面リンクなど強調表示したい場合のフラグ */
  adminAccent?: boolean;
}

export const PUBLIC_SIDEBAR: Readonly<PublicNavItem[]> = [
  { href: '/blog', label: 'Blog' },
  { href: '/status', label: 'Status' },
  { href: '/faq', label: 'FAQ' },
  { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { href: '/admin', label: '管理者', requiresAuth: true, adminAccent: true },
];
