import { format, parseISO, differenceInDays, differenceInHours } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatStr, { locale: id });
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd MMM yyyy HH:mm');
}

export function formatPeriod(start: string | Date, end: string | Date): string {
  return `${formatDate(start, 'dd MMM')} → ${formatDate(end, 'dd MMM yyyy')}`;
}

export function calculateDurationDays(start: string | Date, end: string | Date): number {
  try {
    const dStart = typeof start === 'string' ? parseISO(start) : start;
    const dEnd = typeof end === 'string' ? parseISO(end) : end;
    const diff = differenceInDays(dEnd, dStart);
    return Math.max(1, diff === 0 ? 1 : diff);
  } catch {
    return 1;
  }
}
