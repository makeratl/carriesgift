import { describe, expect, it } from 'vitest';
import { birthdayLabel, daysUntil, timelineStatuses, todayET } from '../lib/dates';

describe('dates', () => {
  it('uses New York, not UTC', () => {
    // 02:30 UTC on Oct 20 is still Oct 19 in New York (EDT, UTC-4).
    expect(todayET(new Date('2026-10-20T02:30:00Z'))).toBe('2026-10-19');
    expect(todayET(new Date('2026-10-20T04:30:00Z'))).toBe('2026-10-20');
    // After DST ends (Nov 1), New York is UTC-5.
    expect(todayET(new Date('2026-11-03T04:30:00Z'))).toBe('2026-11-02');
    expect(todayET(new Date('2026-11-03T05:30:00Z'))).toBe('2026-11-03');
  });

  it('counts days', () => {
    expect(daysUntil('2026-11-03', '2026-10-05')).toBe(29);
    expect(birthdayLabel('2026-10-05')).toBe('29 DAYS');
    expect(birthdayLabel('2026-11-02')).toBe('TOMORROW');
    expect(birthdayLabel('2026-11-03')).toBe('TODAY');
    expect(birthdayLabel('2026-11-04')).toBe('HAPPY BIRTHDAY');
  });

  it('advances the timeline', () => {
    expect(timelineStatuses('2026-10-06')).toEqual(['done', 'done', 'done', 'next', 'ahead', 'ahead', 'ahead']);
    expect(timelineStatuses('2026-10-13')).toEqual(['done', 'done', 'done', 'done', 'next', 'ahead', 'ahead']);
    expect(timelineStatuses('2026-10-19')).toEqual(['done', 'done', 'done', 'done', 'next', 'ahead', 'ahead']);
    expect(timelineStatuses('2026-10-20')).toEqual(['done', 'done', 'done', 'done', 'done', 'next', 'ahead']);
    expect(timelineStatuses('2026-11-03')).toEqual(['done', 'done', 'done', 'done', 'done', 'next', 'done']);
  });
});
