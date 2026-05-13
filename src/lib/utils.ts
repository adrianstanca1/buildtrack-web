import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// BuildTrack is UK-construction focused — default to GBP + en-GB so
// dates read like "13 May 2026" and money like "£1,234.50". Callers
// that need a different locale/currency can pass overrides.
export function formatDate(
  date: string | Date,
  locale: string = 'en-GB'
): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = 'GBP',
  locale: string = 'en-GB'
): string {
  // Backend returns DECIMAL columns as strings ("5400.00"). Accept both
  // so callers don't need a separate toNum helper.
  const n =
    typeof amount === 'number'
      ? amount
      : amount == null
      ? 0
      : parseFloat(String(amount));
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(n);
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}
