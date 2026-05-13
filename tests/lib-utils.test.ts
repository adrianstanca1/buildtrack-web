import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatCurrency, truncate } from '@/lib/utils';

describe('cn (className merger)', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 0, 'b')).toBe('a b');
  });
  it('de-dupes conflicting tailwind utilities (tailwind-merge)', () => {
    // tailwind-merge takes the LAST conflicting class so utility-class
    // overrides work as expected.
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
  it('handles array + object inputs (clsx)', () => {
    expect(cn(['a', { b: true, c: false }, 'd'])).toBe('a b d');
  });
});

describe('formatDate', () => {
  it('formats a date as en-GB by default', () => {
    // 13 May 2026 — en-GB style
    expect(formatDate('2026-05-13')).toMatch(/13.+May.+2026/);
  });
  it('accepts a Date instance', () => {
    expect(formatDate(new Date('2026-05-13T12:00:00Z'))).toMatch(/2026/);
  });
  it('returns empty string for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
  it('respects an explicit locale override', () => {
    // en-US has the format "May 13, 2026"
    expect(formatDate('2026-05-13', 'en-US')).toMatch(/May 13, 2026/);
  });
});

describe('formatCurrency', () => {
  it('formats GBP by default with £ symbol', () => {
    expect(formatCurrency(1500)).toMatch(/£.*1,500/);
  });
  it('handles DECIMAL strings from the backend', () => {
    expect(formatCurrency('5400.00')).toMatch(/£.*5,400/);
  });
  it('returns empty string for non-finite input', () => {
    expect(formatCurrency('not-a-number')).toBe('');
  });
  it('returns £0 for null / undefined', () => {
    expect(formatCurrency(null)).toMatch(/£.*0/);
    expect(formatCurrency(undefined)).toMatch(/£.*0/);
  });
  it('supports currency override', () => {
    expect(formatCurrency(100, 'EUR')).toMatch(/€/);
    expect(formatCurrency(100, 'USD', 'en-US')).toMatch(/\$/);
  });
});

describe('truncate', () => {
  it('returns string unchanged when shorter than limit', () => {
    expect(truncate('short', 10)).toBe('short');
  });
  it('truncates with ellipsis when longer', () => {
    expect(truncate('this is a longer string', 7)).toBe('this is...');
  });
});
