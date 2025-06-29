/* ------------------------------------------------------------------
 *  Currency / Date formatter utilities
 *    - 汎用 formatCurrency(locale, currency) を中心に据える
 *    - Intl.NumberFormat のメモ化で高速化
 * ----------------------------------------------------------------- */

type Locale = 'ja-JP' | 'en-US' | 'en-GB' | string;
export type Currency = 'JPY' | 'USD' | 'EUR' | string;

/** Intl formatter cache（キー: `${locale}_${currency}`）*/
const currencyCache = new Map<string, Intl.NumberFormat>();

/**
 * 任意ロケール / 通貨でフォーマット
 * @example formatCurrency(1234.5, 'USD', 'en-US') => "$1,234.50"
 */
export const formatCurrency = (
  amount: number,
  currency: Currency = 'JPY',
  locale: Locale = 'ja-JP'
) => {
  const key = `${locale}_${currency}`;
  let formatter = currencyCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    });
    currencyCache.set(key, formatter);
  }
  return formatter.format(amount);
};

/* ---- “簡易ラッパー” は後方互換として残す ----------------------- */

/** ¥123,456 – 日本円専用ラッパー（小数点切捨て） */
export const formatCurrencyJP = (amount: number) =>
  formatCurrency(Math.floor(amount), 'JPY', 'ja-JP');

/** YYYY/MM/DD – 日本ロケール固定 */
export const formatDateJP = (d: Date | string) => new Date(d).toLocaleDateString('ja-JP');

/* -------------------------------------------------------------- */
