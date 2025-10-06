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

export const formatDateTime = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const hoursUntil = (value?: string) => {
  if (!value) return undefined;
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return undefined;
  const diffHours = (target - Date.now()) / (1000 * 60 * 60);
  return diffHours;
};

export const formatRelativeHours = (value?: string) => {
  const remaining = hoursUntil(value);
  if (remaining === undefined) return '—';

  const absHours = Math.abs(remaining);
  const days = Math.floor(absHours / 24);
  const hours = Math.max(Math.round(absHours % 24), 0);
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  parts.push(`${hours}h`);

  return `${parts.join(' ')} ${remaining >= 0 ? 'left' : 'overdue'}`;
};
