export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function parseCurrencyInput(value: string | number): number {
  if (typeof value === 'number') return Math.max(0, value);
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? Math.max(0, parseInt(clean, 10)) : 0;
}
