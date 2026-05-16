/** Parses 'HH:MM' to total minutes since midnight. */
export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(min: number): string {
  const wrapped = ((min % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Sleep span in minutes from `sleepTime` to `wakeTime`, crossing midnight if
 * needed (the usual case). A same-time pair returns 24h.
 */
export function sleepDurationMinutes(sleepTime: string, wakeTime: string): number {
  const s = timeToMinutes(sleepTime);
  const w = timeToMinutes(wakeTime);
  let diff = w - s;
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export function formatHourLabel(hhmm: string): string {
  const [hRaw, m] = hhmm.split(':').map(Number);
  const h = hRaw ?? 0;
  const mins = m ?? 0;
  const period = h >= 12 ? 'pm' : 'am';
  const display = ((h + 11) % 12) + 1;
  const mm = String(mins).padStart(2, '0');
  return `${display}:${mm} ${period}`;
}

export function formatSleepDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} hrs`;
  return `${h}h ${m}m`;
}

export function isoToday(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function greetingForHour(hour: number): 'Good morning' | 'Good afternoon' | 'Good evening' {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Days of the week starting Monday — matches the prototype's `M T W T F S S` row. */
export const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/**
 * Returns the Monday on or before `date`, with the time stripped to 00:00 local.
 * Mirrors ISO 8601's Monday-as-start-of-week. JS `Date.getDay()` returns 0 for
 * Sunday — we shift by 6 to fold Sunday into the previous Monday's row.
 */
export function startOfMondayWeek(date: Date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = d.getDay(); // 0 (Sun) – 6 (Sat)
  const offset = (dow + 6) % 7; // 0 (Mon) – 6 (Sun)
  d.setDate(d.getDate() - offset);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** Builds the 7 ISO date strings (Mon → Sun) for the week containing `date`. */
export function weekDates(date: Date = new Date()): string[] {
  const monday = startOfMondayWeek(date);
  return Array.from({ length: 7 }, (_, i) => isoToday(addDays(monday, i)));
}

/** True if two ISO date strings refer to the same calendar day. */
export function isSameIsoDate(a: string, b: string): boolean {
  return a === b;
}
