// app/_utils/billing/price-utils.ts
export const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
  }).format(amount);
