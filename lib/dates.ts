export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + amount);
  return d;
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function endOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

export function compactGridDates(days = 126): string[] {
  const today = todayUtc();
  const weeks = Math.max(1, Math.ceil(days / 7));
  const currentWeekStart = startOfWeekMonday(today);
  const start = addDays(currentWeekStart, -((weeks - 1) * 7));
  return Array.from({ length: weeks * 7 }, (_, i) => toDateOnlyString(addDays(start, i)));
}

export function monthCalendar(year: number, monthIndex: number) {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const last = new Date(Date.UTC(year, monthIndex + 1, 0));
  const leading = (first.getUTCDay() + 6) % 7; // Monday-first
  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < leading; i++) cells.push({ date: null, day: null });
  for (let day = 1; day <= last.getUTCDate(); day++) {
    const d = new Date(Date.UTC(year, monthIndex, day));
    cells.push({ date: toDateOnlyString(d), day });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null });
  return cells;
}
