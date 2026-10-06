// All date logic is pinned to America/New_York so the server render and the
// browser agree no matter where a visitor is.

export const TZ = 'America/New_York';
export const PREOP = '2026-10-13';
export const SURGERY = '2026-10-20';
export const BIRTHDAY = '2026-11-03';

export type Status = 'done' | 'next' | 'ahead';

/** Today's calendar date in New York as YYYY-MM-DD. */
export function todayET(now: Date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Whole days from `today` until `target` (both YYYY-MM-DD). Negative once past. */
export function daysUntil(target: string, today: string) {
  return Math.round((Date.parse(target + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 864e5);
}

export function birthdayLabel(today: string) {
  const d = daysUntil(BIRTHDAY, today);
  return d > 1 ? `${d} DAYS` : d === 1 ? 'TOMORROW' : d === 0 ? 'TODAY' : 'HAPPY BIRTHDAY';
}

/** Statuses for the seven timeline steps, in order. */
export function timelineStatuses(today: string): Status[] {
  const postPreop = daysUntil(PREOP, today) <= 0;
  const postSurgery = daysUntil(SURGERY, today) <= 0;
  const bdayPassed = daysUntil(BIRTHDAY, today) <= 0;
  return [
    'done', 'done', 'done',
    postPreop ? 'done' : 'next',
    postSurgery ? 'done' : postPreop ? 'next' : 'ahead',
    postSurgery ? 'next' : 'ahead',
    bdayPassed ? 'done' : 'ahead',
  ];
}
