export const fmtDate = (iso: string) => new Date(iso).toLocaleString('ja-JP', { hour12: false });

export const percent = (n: number) => `${n.toFixed(2)}%`;
