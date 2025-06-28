/** ¥123,456 のように日本円で表示 */
export const formatCurrencyJP = (amount: number) => `¥${Math.floor(amount).toLocaleString()}`;

/** YYYY/MM/DD を日本ロケールで */
export const formatDateJP = (d: Date | string) => new Date(d).toLocaleDateString('ja-JP');
