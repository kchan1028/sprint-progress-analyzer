export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole days between two dates (b - a), truncated. Negative if b is before a. */
export function daysBetween(a: Date | string, b: Date | string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = startOfDay(new Date(a)).getTime();
  const end = startOfDay(new Date(b)).getTime();
  return Math.round((end - start) / msPerDay);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatShortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
