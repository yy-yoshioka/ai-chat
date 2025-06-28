/**
 * URL クエリ `?from=/path` からリダイレクト先を取得
 * fallback を渡さなければ /profile へ
 */
export const getRedirectPath = (fallback: string = '/profile'): string => {
  if (typeof window === 'undefined') return fallback;
  const p = new URLSearchParams(window.location.search).get('from');
  return p || fallback;
};
