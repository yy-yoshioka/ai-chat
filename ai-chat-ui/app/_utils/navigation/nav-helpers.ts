/**
 * UI を持たない純粋なヘルパー関数群
 */

export const isActive = (pathname: string, href: string): boolean =>
  href === '/'
    ? pathname === '/'
    : // /admin で始まるパスをまとめて active 扱いにしたい場合にも対応
      pathname.startsWith(href);

/** ユーザー名からイニシャルを生成  */
export const getUserInitials = (name?: string): string => {
  if (!name) return 'U';
  const names = name.trim().split(/\s+/);
  return names.length === 1
    ? names[0][0].toUpperCase()
    : `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
};
