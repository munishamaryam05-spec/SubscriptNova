import { BillingFrequency } from '../types/plan';

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function pad(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatDateISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Subtract specified number of days from an ISO date string (YYYY-MM-DD).
 */
export function subtractDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - days);
  return formatDateISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Add specified number of days to an ISO date string (YYYY-MM-DD).
 */
export function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  return formatDateISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Robustly advances a date by frequency, correctly clamping month-end dates and leap years.
 * - Jan 31 (Monthly) -> Feb 28 (or Feb 29 in leap year)
 * - March 31 (Monthly) -> April 30
 * - Feb 29, 2024 (Yearly) -> Feb 28, 2025
 */
export function calculateNextBillingDate(startDateStr: string, frequency: BillingFrequency): string {
  const parts = startDateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    const d = new Date(startDateStr);
    return isNaN(d.getTime()) ? startDateStr : d.toISOString().split('T')[0];
  }

  const [year, month, day] = parts;
  const monthIdx = month - 1; // 0-indexed

  switch (frequency) {
    case 'Daily': {
      const d = new Date(year, monthIdx, day);
      d.setDate(d.getDate() + 1);
      return formatDateISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
    }
    case 'Weekly': {
      const d = new Date(year, monthIdx, day);
      d.setDate(d.getDate() + 7);
      return formatDateISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
    }
    case 'Monthly': {
      let nextYear = year;
      let nextMonthIdx = monthIdx + 1;
      if (nextMonthIdx > 11) {
        nextYear += 1;
        nextMonthIdx = 0;
      }
      const maxDays = getDaysInMonth(nextYear, nextMonthIdx);
      const nextDay = Math.min(day, maxDays);
      return formatDateISO(nextYear, nextMonthIdx + 1, nextDay);
    }
    case 'Yearly': {
      const nextYear = year + 1;
      const maxDays = getDaysInMonth(nextYear, monthIdx);
      const nextDay = Math.min(day, maxDays);
      return formatDateISO(nextYear, monthIdx + 1, nextDay);
    }
    default:
      return startDateStr;
  }
}

/**
 * Calculates the exact billing period (periodStart, periodEnd) and the resulting nextBillingDate.
 * Handled with month-end and leap-year precision.
 */
export function calculateBillingPeriod(
  currentBillingDateStr: string,
  frequency: BillingFrequency
): {
  periodStart: string;
  periodEnd: string;
  nextBillingDate: string;
} {
  const periodStart = currentBillingDateStr;
  const nextBillingDate = calculateNextBillingDate(currentBillingDateStr, frequency);

  let periodEnd: string;
  if (frequency === 'Daily') {
    periodEnd = currentBillingDateStr;
  } else {
    periodEnd = subtractDays(nextBillingDate, 1);
  }

  return {
    periodStart,
    periodEnd,
    nextBillingDate,
  };
}

/**
 * Normalizes recurring amounts to Monthly Recurring Revenue (MRR).
 */
export function calculateMRRFromSubscription(
  amount: number,
  quantity: number,
  frequency: BillingFrequency
): number {
  const total = amount * (quantity || 1);
  switch (frequency) {
    case 'Daily':
      return total * 30.41;
    case 'Weekly':
      return total * 4.33;
    case 'Monthly':
      return total;
    case 'Yearly':
      return total / 12;
    default:
      return total;
  }
}

/**
 * Formats YYYY-MM-DD to a clean readable date string e.g. "Oct 31, 2026"
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

/**
 * Formats a billing period range e.g. "Oct 01, 2026 – Oct 31, 2026"
 */
export function formatPeriodRange(start?: string, end?: string): string {
  if (!start && !end) return '—';
  if (!end) return formatDateDisplay(start);
  return `${formatDateDisplay(start)} – ${formatDateDisplay(end)}`;
}
