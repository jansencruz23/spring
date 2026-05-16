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
