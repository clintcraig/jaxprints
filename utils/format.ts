export const formatCurrency = (value: number, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);

export const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const daysUntil = (date?: string) => {
  if (!date) return undefined;
  const target = new Date(date).getTime();
  if (Number.isNaN(target)) return undefined;
  const today = new Date();
  const diff = Math.ceil((target - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};
